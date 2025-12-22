
import { LoginForm } from "@/components/auth/login-form"
import { MagicAuthLayout } from "@/components/layouts/magic-auth-layout"

export default function LoginPage() {
  return (
    <MagicAuthLayout
      title="Access your Account"
      description="Enter your credentials below to access the JurisQBank platform."
    >
      <LoginForm />
    </MagicAuthLayout>
  )
}
