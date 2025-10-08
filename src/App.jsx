import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import KindeProvider from "@/components/auth/KindeProvider"

function App() {
  return (
    <KindeProvider>
      <Pages />
      <Toaster />
    </KindeProvider>
  )
}

export default App 