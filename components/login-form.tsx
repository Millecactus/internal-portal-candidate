'use client'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { fetchWithoutAuth } from "@/lib/api-request-utils"
import { Mail } from "lucide-react"

interface LoginFormProps {
  initialEmail?: string;
}

export function LoginForm({ initialEmail = "" }: LoginFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mettre à jour l'email si initialEmail change
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await fetchWithoutAuth('/candidate/magic-link', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      setIsSubmitted(true)
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        setError("Candidat non trouvé")
      } else {
        setError("Une erreur est survenue lors de l&apos;envoi du lien")
      }
    }
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#f8fafb' }}>
        <Image src="/01.png" alt="Logo Programisto" width={240} height={80} className="mb-8" />
        <Card className="flex w-full max-w-3xl p-0 shadow-lg">
          <div className="flex-1 flex flex-col justify-center p-12">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold mb-4">Lien de connexion envoyé par mail</h2>
              <Mail className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-muted-foreground">Vérifiez votre boîte mail et cliquez sur le lien pour vous connecter</p>
            </div>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-100 rounded-r-lg">
            <div className="w-40 h-40 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-500 ease-in-out hover:scale-x-[-1]">
              <Image
                src="/54.png"
                alt="Illustration"
                width={160}
                height={160}
                className="w-full h-full object-cover ml-[-45px] mt-[48px]"
              />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#f8fafb' }}>
      <Image src="/01.png" alt="Logo Programisto" width={240} height={80} className="mb-8" />
      <Card className="flex w-full max-w-3xl p-0 shadow-lg">
        <div className="flex-1 flex flex-col justify-center p-12">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-2 ">Espace candidat</h2>
            <p className="text-muted-foreground mb-6 text-justify">Recevez un lien magique par email pour vous connecter ou créer un compte</p>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <Button type="submit" className="w-full text-white flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Recevoir un lien magique
            </Button>
          </form>
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-100 rounded-r-lg">
          <div className="w-40 h-40 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center transition-transform duration-500 ease-in-out hover:scale-x-[-1]">
            <Image
              src="/54.png"
              alt="Illustration"
              width={160}
              height={160}
              className="w-full h-full object-cover ml-[-45px] mt-[48px]"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
