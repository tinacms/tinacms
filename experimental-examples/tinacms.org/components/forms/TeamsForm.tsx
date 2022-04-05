import React, { useState } from 'react'
import styled from 'styled-components'

import { Input, Button, Textarea } from '../ui'

export function TeamsForm(props: any) {
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [technology, setTechnology] = useState('')
  const [projectDetails, setProjectDetails] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')

  async function postForm(data: any) {
    const hubspotFormID = process.env.HUBSPOT_TEAMS_FORM_ID
    const hubspotPortalID = process.env.HUBSPOT_PORTAL_ID

    if (hubspotFormID && hubspotPortalID) {
      const url = `https://api.hsforms.com/submissions/v3/integration/submit/${hubspotPortalID}/${hubspotFormID}`
      try {
        const rawResponse = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        const response = await rawResponse.json()
        const message = response.inlineMessage.replace(/<[^>]*>/g, '').trim()
        alert(message)
      } catch (e) {
        alert('Looks like an error, please email support@forestry.io')
        console.error(e)
      }
    } else {
      console.error('Teams Form: Environment variables missing')
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFirstName(e.target.value)
  }
  function handleSurnameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSurname(e.target.value)
  }
  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
  }
  function handleProjectDetailsChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setProjectDetails(e.target.value)
  }
  function handleTechnologyChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTechnology(e.target.value)
  }
  function handleCompanyChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCompany(e.target.value)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = {
      fields: [
        {
          name: 'firstname',
          value: firstName,
        },
        {
          name: 'lastname',
          value: surname,
        },
        {
          name: 'email',
          value: email,
        },
        {
          name: 'technology',
          value: technology,
        },
        {
          name: 'project_details',
          value: projectDetails,
        },
        {
          name: 'company',
          value: company,
        },
      ],
    }
    if (process.env.NODE_ENV === 'production') {
      postForm(formData)
    } else {
      console.error('Teams form only posts in production')
    }
  }

  return (
    <StyledForm onSubmit={handleSubmit}>
      <h3>Tina Cloud Early Access</h3>
      <label>
        <p>First Name</p>
        <Input
          type="text"
          id="name"
          name="name"
          value={firstName}
          onChange={handleNameChange}
        />
      </label>
      <label>
        <p>Last Name</p>
        <Input
          type="text"
          id="surname"
          name="surname"
          value={surname}
          onChange={handleSurnameChange}
        />
      </label>
      <label>
        <p>Email</p>
        <Input
          type="text"
          id="email"
          name="email"
          required
          value={email}
          onChange={handleEmailChange}
        />
      </label>
      <label>
        <p>Company</p>
        <Input
          type="text"
          id="company"
          name="company"
          value={company}
          onChange={handleCompanyChange}
        />
      </label>
      <label>
        <p>What technology are you currently using?</p>
        <Input
          type="text"
          id="technology"
          name="technology"
          placeholder="Frameworks, static site generators..."
          value={technology}
          onChange={handleTechnologyChange}
        />
      </label>
      <label>
        <p>Tell us a little bit about your project</p>
        <Textarea
          id="project-details"
          name="project-details"
          rows={4}
          required
          value={projectDetails}
          onChange={handleProjectDetailsChange}
        />
      </label>
      <Button type="submit" color="primary">
        Request Access
      </Button>
    </StyledForm>
  )
}

const StyledForm = styled.form`
  h3 {
    text-transform: uppercase;
    color: var(--color-orange) !important;
    text-align: center;
  }

  ${Button} {
    margin: 1.5rem auto 0 auto;
  }

  p {
    color: var(--color-seafoam-dark) !important;
    margin: 1rem 0 0.5rem 0 !important;
  }
`
