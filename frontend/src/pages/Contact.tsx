import type React from "react"
import { TextField, Button } from "@mui/material"

const Contact = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Gérer la soumission du formulaire ici
  }

  return (
    <div className="container mx-auto px-4">
      <div className="py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Contactez-nous</h1>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField label="Nom" variant="outlined" fullWidth required className="bg-white" />
            <TextField label="Email" variant="outlined" type="email" fullWidth required className="bg-white" />
            <TextField label="Message" variant="outlined" multiline rows={4} fullWidth required className="bg-white" />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              Envoyer
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contact

