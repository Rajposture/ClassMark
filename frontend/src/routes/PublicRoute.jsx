import { useUser } from "@clerk/clerk-react"
import { Navigate } from "react-router-dom"

const PublicRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) return null

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PublicRoute