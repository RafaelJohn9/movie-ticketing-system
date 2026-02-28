import { useState } from 'react'

const INITIAL_FORM = {
  full_name: '',
  email: '',
  phone_number: '',
  ticket_type: 'Regular',
}

export function useTicketForm() {
  const [form, setForm] = useState(INITIAL_FORM)

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const reset = () => setForm(INITIAL_FORM)

  return { form, update, reset }
}
