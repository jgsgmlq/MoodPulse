import { ReportWindow } from './components/ReportWindow'
import { appWindow } from '@tauri-apps/api/window'

export default function Report() {
  const handleClose = async () => {
    await appWindow.hide()
  }

  return <ReportWindow onClose={handleClose} />
}
