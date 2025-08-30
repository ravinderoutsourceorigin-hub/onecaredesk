import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import AuthWrapper from "@/components/auth/AuthWrapper"
import KindeProvider from "@/components/auth/KindeProvider"

function App() {
  return (
    <KindeProvider>
      <AuthWrapper>
        <Pages />
        <Toaster />
      </AuthWrapper>
    </KindeProvider>
  )
}

export default App 