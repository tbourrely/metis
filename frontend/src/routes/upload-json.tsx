import { createFileRoute } from '@tanstack/react-router'
import UploadJson from '../views/UploadJson'

export const Route = createFileRoute('/upload-json')({
  component: Index,
})

function Index() {
  return <UploadJson />
}
