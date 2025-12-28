use crate::db::EmotionRecord;
use serde::{Deserialize, Serialize};
use chrono::{NaiveDateTime, Timelike};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct EmotionAnalysis {
    pub emotion_index: f64,      // 情绪指数 (1-10)
    pub stress_level: f64,        // 压力水平 (0-100)
    pub total_records: usize,     // 总记录数
    pub valid_records: usize,     // 有效记录数
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimelinePoint {
    pub time: String,           // 时间标签 "8:00"
    pub value: f64,             // 情绪值 (0-1)
    pub emoji: String,          // 表情符号
    pub emotion: String,        // 情绪类别
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FocusAnalysis {
    pub total_focus_sessions: usize,  // 今日专注次数（超过30分钟）
    pub current_focus_duration: f64,  // 当前专注时长（分钟）
    pub is_currently_focusing: bool,  // 是否正在专注
    pub total_focus_time: f64,        // 今日总专注时长（分钟）
}

/// 情绪类别到分数的映射
fn emotion_to_score(emotion: &str) -> f64 {
    match emotion {
        "happy" => 10.0,
        "calm" => 7.0,
        "neutral" => 5.0,
        "worried" => 3.0,
        "sad" => 2.0,
        "angry" => 1.0,
        "tired" => 4.0,  // 添加tired的映射
        _ => 5.0,
    }
}

/// 计算情绪指数（10分制）
/// 组合模型：加权时序衰减 + 多模态置信度融合
pub fn calculate_emotion_index(records: &[EmotionRecord]) -> f64 {
    // 过滤有效记录（有人脸且未离开）
    let valid_records: Vec<&EmotionRecord> = records
        .iter()
        .filter(|r| r.has_face && !r.is_away)
        .collect();

    if valid_records.is_empty() {
        return 5.0; // 无有效数据返回中性值
    }

    // ===== 第一步：多模态置信度融合 =====
    let mut fused_scores = Vec::new();

    for record in &valid_records {
        let fer_score = emotion_to_score(&record.fer_emotion);
        let deepface_score = record
            .deepface_emotion
            .as_ref()
            .map(|e| emotion_to_score(e))
            .unwrap_or(5.0);

        let fer_conf = record.fer_confidence;
        let deepface_conf = record.deepface_confidence.unwrap_or(0.0);
        let total_conf = fer_conf + deepface_conf;

        // 按置信度加权平均
        let base_fused_score = if total_conf > 0.0 {
            (fer_score * fer_conf + deepface_score * deepface_conf) / total_conf
        } else {
            5.0
        };

        // 一致性加成：两模型预测一致时提升0.5分
        let consistency_bonus = if record.deepface_emotion.as_ref() == Some(&record.fer_emotion) {
            0.5
        } else {
            0.0
        };

        let fused_score = (base_fused_score + consistency_bonus).min(10.0);
        let confidence = fer_conf.max(deepface_conf);

        fused_scores.push((fused_score, confidence));
    }

    // ===== 第二步：加权时序衰减 =====
    let n = fused_scores.len();
    let mut total_weighted_score = 0.0;
    let mut total_weight = 0.0;
    let mut peak_score = 0.0;
    let mut final_score = 0.0;

    for (i, (score, confidence)) in fused_scores.iter().enumerate() {
        // 时间衰减权重：指数衰减，越近的记录权重越高
        let decay_rate = 0.1;
        let time_weight = (-decay_rate * (n - i - 1) as f64).exp();

        // 综合权重 = 时间权重 × 置信度
        let combined_weight = time_weight * confidence;

        total_weighted_score += score * combined_weight;
        total_weight += combined_weight;

        // 记录峰值情绪
        if *score > peak_score {
            peak_score = *score;
        }

        // 记录最后一条的情绪
        if i == n - 1 {
            final_score = *score;
        }
    }

    let weighted_avg = if total_weight > 0.0 {
        total_weighted_score / total_weight
    } else {
        5.0
    };

    // ===== 第三步：峰终定律综合 =====
    // 60% 加权平均 + 20% 峰值 + 20% 终值
    let emotion_index = 0.6 * weighted_avg + 0.2 * peak_score + 0.2 * final_score;

    // 确保分数在1-10范围内
    emotion_index.max(1.0).min(10.0)
}

/// 计算压力水平（百分制，0-100）
/// 基于情绪波动惩罚模型
pub fn calculate_stress_level(records: &[EmotionRecord]) -> f64 {
    // 过滤有效记录
    let valid_records: Vec<&EmotionRecord> = records
        .iter()
        .filter(|r| r.has_face && !r.is_away)
        .collect();

    if valid_records.is_empty() {
        return 50.0; // 无数据返回中等压力值
    }

    // ===== 第一步：收集加权情绪分数 =====
    let weighted_scores: Vec<f64> = valid_records
        .iter()
        .map(|record| {
            let base_score = emotion_to_score(&record.mapped_emotion);
            let confidence = record
                .fer_confidence
                .max(record.deepface_confidence.unwrap_or(0.0));
            base_score * confidence
        })
        .collect();

    // ===== 第二步：计算基础指标 =====
    let mean_score: f64 = weighted_scores.iter().sum::<f64>() / weighted_scores.len() as f64;

    // 计算标准差
    let variance: f64 = weighted_scores
        .iter()
        .map(|score| {
            let diff = score - mean_score;
            diff * diff
        })
        .sum::<f64>()
        / weighted_scores.len() as f64;
    let std_score = variance.sqrt();

    // 负面情绪占比（分数<5的记录）
    let negative_count = weighted_scores.iter().filter(|&&s| s < 5.0).count();
    let negative_ratio = negative_count as f64 / weighted_scores.len() as f64;

    // ===== 第三步：计算压力成分 =====

    // 成分1: 情绪低落因子（0-40分）
    let emotion_low_stress = ((10.0 - mean_score) / 9.0 * 40.0).max(0.0);

    // 成分2: 波动性因子（0-30分）
    let volatility_stress = (std_score / 3.0 * 30.0).min(30.0);

    // 成分3: 负面情绪占比因子（0-30分）
    let negative_stress = negative_ratio * 30.0;

    // ===== 第四步：综合压力水平 =====
    let total_stress = emotion_low_stress + volatility_stress + negative_stress;

    // 确保在0-100范围内
    total_stress.max(0.0).min(100.0)
}

/// 分析今日情绪数据
pub fn analyze_today_emotions(records: Vec<EmotionRecord>) -> EmotionAnalysis {
    let total_records = records.len();
    let valid_records = records
        .iter()
        .filter(|r| r.has_face && !r.is_away)
        .count();

    let emotion_index = calculate_emotion_index(&records);
    let stress_level = calculate_stress_level(&records);

    EmotionAnalysis {
        emotion_index: (emotion_index * 100.0).round() / 100.0, // 保留2位小数
        stress_level: (stress_level * 100.0).round() / 100.0,
        total_records,
        valid_records,
    }
}

/// 获取情绪时间线（30分钟间隔）
pub fn get_emotion_timeline(records: Vec<EmotionRecord>) -> Vec<TimelinePoint> {
    let valid_records: Vec<&EmotionRecord> = records
        .iter()
        .filter(|r| r.has_face && !r.is_away)
        .collect();

    if valid_records.is_empty() {
        return Vec::new();
    }

    // 按30分钟间隔分组
    let mut interval_map: HashMap<String, Vec<f64>> = HashMap::new();

    for record in valid_records {
        if let Ok(dt) = NaiveDateTime::parse_from_str(&record.datetime, "%Y-%m-%d %H:%M:%S") {
            let hour = dt.hour();
            let minute = if dt.minute() < 30 { 0 } else { 30 };
            let time_key = format!("{}:{:02}", hour, minute);

            let score = emotion_to_score(&record.mapped_emotion);
            interval_map.entry(time_key).or_insert_with(Vec::new).push(score);
        }
    }

    // 计算每个间隔的平均值并转换为TimelinePoint
    let mut timeline: Vec<TimelinePoint> = interval_map
        .iter()
        .map(|(time, scores)| {
            let avg_score = scores.iter().sum::<f64>() / scores.len() as f64;
            let value = (avg_score / 10.0 * 100.0).round() / 100.0; // 转换为0-1范围

            let (emoji, emotion) = if avg_score >= 8.0 {
                ("😊".to_string(), "happy".to_string())
            } else if avg_score >= 6.0 {
                ("😌".to_string(), "calm".to_string())
            } else if avg_score >= 4.0 {
                ("😴".to_string(), "tired".to_string())
            } else {
                ("😟".to_string(), "worried".to_string())
            };

            TimelinePoint {
                time: time.clone(),
                value,
                emoji,
                emotion,
            }
        })
        .collect();

    // 按时间排序
    timeline.sort_by(|a, b| {
        let parse_time = |s: &str| -> (u32, u32) {
            let parts: Vec<&str> = s.split(':').collect();
            (parts[0].parse().unwrap_or(0), parts[1].parse().unwrap_or(0))
        };
        let (ah, am) = parse_time(&a.time);
        let (bh, bm) = parse_time(&b.time);
        (ah, am).cmp(&(bh, bm))
    });

    timeline
}

/// 分析专注时长
pub fn analyze_focus_time(records: Vec<EmotionRecord>) -> FocusAnalysis {
    if records.is_empty() {
        return FocusAnalysis {
            total_focus_sessions: 0,
            current_focus_duration: 0.0,
            is_currently_focusing: false,
            total_focus_time: 0.0,
        };
    }

    // 按时间排序
    let mut sorted_records = records;
    sorted_records.sort_by_key(|r| r.timestamp);

    // 识别专注时段（连续的has_face=1且is_away=0的记录）
    let mut focus_sessions: Vec<(i64, i64)> = Vec::new(); // (start_timestamp, end_timestamp)
    let mut session_start: Option<i64> = None;
    let mut last_timestamp: Option<i64> = None;

    const MAX_GAP_SECONDS: i64 = 60; // 最大间隔60秒，超过则认为是新的专注时段
    const MIN_FOCUS_MINUTES: f64 = 30.0; // 最小专注时长30分钟

    for record in &sorted_records {
        let is_focusing = record.has_face && !record.is_away;

        if is_focusing {
            if let Some(start) = session_start {
                // 检查是否与上一条记录间隔过大
                if let Some(last_ts) = last_timestamp {
                    if record.timestamp - last_ts > MAX_GAP_SECONDS {
                        // 间隔过大，结束当前专注时段
                        focus_sessions.push((start, last_ts));
                        session_start = Some(record.timestamp);
                    }
                }
                last_timestamp = Some(record.timestamp);
            } else {
                // 开始新的专注时段
                session_start = Some(record.timestamp);
                last_timestamp = Some(record.timestamp);
            }
        } else {
            // 不在专注状态
            if let Some(start) = session_start {
                if let Some(last_ts) = last_timestamp {
                    focus_sessions.push((start, last_ts));
                }
                session_start = None;
                last_timestamp = None;
            }
        }
    }

    // 处理最后一个专注时段
    if let Some(start) = session_start {
        if let Some(last_ts) = last_timestamp {
            focus_sessions.push((start, last_ts));
        }
    }

    // 计算专注次数和总时长
    let mut total_focus_sessions = 0;
    let mut total_focus_time = 0.0;

    for (start, end) in &focus_sessions {
        let duration_minutes = (end - start) as f64 / 60.0;
        if duration_minutes >= MIN_FOCUS_MINUTES {
            total_focus_sessions += 1;
        }
        total_focus_time += duration_minutes;
    }

    // 判断当前是否在专注中
    let is_currently_focusing = if let Some(last_record) = sorted_records.last() {
        last_record.has_face && !last_record.is_away
    } else {
        false
    };

    // 计算当前专注时长
    let current_focus_duration = if is_currently_focusing && !focus_sessions.is_empty() {
        let (start, end) = focus_sessions.last().unwrap();
        (end - start) as f64 / 60.0
    } else {
        0.0
    };

    FocusAnalysis {
        total_focus_sessions,
        current_focus_duration: (current_focus_duration * 10.0).round() / 10.0,
        is_currently_focusing,
        total_focus_time: (total_focus_time * 10.0).round() / 10.0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_emotion_to_score() {
        assert_eq!(emotion_to_score("happy"), 10.0);
        assert_eq!(emotion_to_score("calm"), 7.0);
        assert_eq!(emotion_to_score("worried"), 3.0);
    }

    #[test]
    fn test_calculate_emotion_index_empty() {
        let records = vec![];
        let index = calculate_emotion_index(&records);
        assert_eq!(index, 5.0);
    }

    #[test]
    fn test_calculate_stress_level_empty() {
        let records = vec![];
        let stress = calculate_stress_level(&records);
        assert_eq!(stress, 50.0);
    }
}
