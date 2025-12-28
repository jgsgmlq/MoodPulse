import cv2
from fer.fer import FER
from deepface import DeepFace
import json
import sys
import time
from collections import deque

class EmotionDetector:
    def __init__(self):
        self.fer_detector = FER()
        self.cap = None
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.face_detection_window = deque(maxlen=50)
        self.work_start_time = time.time()
        self.last_away_time = None
        self.alert_interval = 45 * 60
        self.away_threshold = 10
        self.tired_threshold = 30  # 工作30分钟后可能疲惫

    def map_emotion_to_frontend(self, emotion):
        """将FER/DeepFace的7种情绪映射为前端的4种情绪"""
        emotion_map = {
            'happy': 'happy',
            'surprise': 'happy',
            'neutral': 'calm',
            'sad': 'worried',
            'fear': 'worried',
            'disgust': 'worried',
            'angry': 'worried'
        }
        return emotion_map.get(emotion, 'calm')

    def determine_final_emotion(self, mapped_emotion, work_minutes):
        """根据工作时长调整情绪，判断是否疲惫"""
        if work_minutes > self.tired_threshold and mapped_emotion in ['worried', 'calm']:
            return 'tired'
        return mapped_emotion

    def init_camera(self):
        # Check if camera needs initialization or reinitialization
        if self.cap is None or not self.cap.isOpened():
            # Release existing resource if any
            if self.cap is not None:
                self.cap.release()
                self.cap = None

            # Try DirectShow backend first (more reliable on Windows)
            self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
            if not self.cap.isOpened():
                # Release failed attempt
                self.cap.release()
                # Fallback to default backend
                self.cap = cv2.VideoCapture(0)
                if not self.cap.isOpened():
                    # Release if still failed
                    self.cap.release()
                    self.cap = None
                    return False
        return self.cap.isOpened()

    def detect_emotion(self):
        try:
            if not self.init_camera():
                return {"error": "Cannot open camera"}

            ret, frame = self.cap.read()
            if not ret:
                # Camera read failed, try to reinitialize next time
                if self.cap is not None:
                    self.cap.release()
                    self.cap = None
                return {"error": "Cannot read frame"}

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 9)

            has_face = len(faces) > 0
            self.face_detection_window.append(1 if has_face else 0)

            is_away = self._check_user_away()
            current_time = time.time()

            if is_away:
                if self.last_away_time is None:
                    self.last_away_time = current_time
                self.work_start_time = current_time
            else:
                if self.last_away_time is not None:
                    self.last_away_time = None

            work_duration = current_time - self.work_start_time
            need_alert = work_duration >= self.alert_interval

            result = {
                "has_face": has_face,
                "is_away": is_away,
                "work_minutes": work_duration / 60,
                "need_break_alert": need_alert and not is_away,
                "emotions": []
            }

            for (x, y, w, h) in faces:
                face = frame[y:y + h, x:x + w]

                try:
                    emotion_fer, score_fer = self.fer_detector.top_emotion(face)

                    # 映射FER情绪
                    mapped_fer = self.map_emotion_to_frontend(emotion_fer) if emotion_fer else 'calm'

                    # 根据工作时长判断最终情绪
                    final_emotion = self.determine_final_emotion(mapped_fer, work_duration / 60)

                    emotion_data = {
                        "emotion": final_emotion,
                        "confidence": float(score_fer) if score_fer else 0.0,
                        "source": "fer"
                    }

                    result["emotions"].append(emotion_data)
                except Exception as e:
                    sys.stderr.write(f"FER detection error: {e}\n")
                    sys.stderr.flush()

                try:
                    analysis = DeepFace.analyze(face, actions=['emotion'], enforce_detection=False)
                    emotion_deepface = analysis[0]['dominant_emotion']
                    score_deepface = analysis[0]['emotion'][emotion_deepface]

                    # 映射DeepFace情绪
                    mapped_deepface = self.map_emotion_to_frontend(emotion_deepface)
                    final_deepface = self.determine_final_emotion(mapped_deepface, work_duration / 60)

                    # 添加DeepFace结果
                    result["emotions"].append({
                        "emotion": final_deepface,
                        "confidence": float(score_deepface),
                        "source": "deepface"
                    })
                except Exception as e:
                    sys.stderr.write(f"DeepFace detection error: {e}\n")
                    sys.stderr.flush()

            return result

        except cv2.error as e:
            sys.stderr.write(f"OpenCV error in detect_emotion: {e}\n")
            sys.stderr.flush()
            # Release camera on OpenCV error
            if self.cap is not None:
                self.cap.release()
                self.cap = None
            return {"error": f"OpenCV error: {str(e)}"}
        except Exception as e:
            sys.stderr.write(f"Unexpected error in detect_emotion: {e}\n")
            sys.stderr.flush()
            return {"error": f"Detection error: {str(e)}"}

    def _check_user_away(self):
        if len(self.face_detection_window) < 50:
            return False
        face_count = sum(self.face_detection_window)
        return face_count < self.away_threshold

    def release(self):
        if self.cap:
            self.cap.release()

if __name__ == "__main__":
    detector = EmotionDetector()
    sys.stderr.write("Emotion service started\n")
    sys.stderr.flush()

    try:
        while True:
            line = sys.stdin.readline().strip()
            if not line:
                continue
            if line == "DETECT":
                result = detector.detect_emotion()
                print(json.dumps(result))
                sys.stdout.flush()
            elif line == "QUIT":
                sys.stderr.write("Shutting down emotion service\n")
                sys.stderr.flush()
                break
            else:
                sys.stderr.write(f"Unknown command: {line}\n")
                sys.stderr.flush()
    except KeyboardInterrupt:
        pass
    except Exception as e:
        sys.stderr.write(f"Error in emotion service: {e}\n")
        sys.stderr.flush()
    finally:
        detector.release()
        sys.stderr.write("Emotion service stopped\n")
        sys.stderr.flush()
