import React, {useCallback, useEffect, useMemo} from 'react'
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from '@mui/material'
import {useNavigate} from 'react-router-dom'
import Config, {setServer, setUsername} from '../../config'

export default function Home() {
  const navigate = useNavigate()

  const idServerMemo = useMemo(function idServer() {
    return `${Date.now()}-${Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)}`
  }, [])

  const redirectionCallback = useCallback(
    function redirection() {
      navigate('/game', {replace: true})
    },
    [navigate],
  )

  const submitCallback = useCallback(
    function submit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault()
      const data = new FormData(event.currentTarget)
      const username = data.get('username')?.toString()
      const server = data.get('server')?.toString()

      if (username) {
        setUsername(username)
        setServer(server || idServerMemo, !server)
        redirectionCallback()
      }
    },
    [idServerMemo, redirectionCallback],
  )

  useEffect(
    function init() {
      if (Config.user.server.root) {
        redirectionCallback()
      }
    },
    [redirectionCallback],
  )

  return (
    <Container component={'main'} maxWidth={'xs'}>
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <Typography component={'h1'} variant={'h5'}>
          RPG
        </Typography>
        <Box
          component={'form'}
          onSubmit={submitCallback}
          noValidate
          sx={{mt: 1}}>
          <TextField
            margin={'normal'}
            required
            fullWidth
            id={'username'}
            name={'username'}
            label={'Username'}
            value={Config.user.username}
            autoFocus
          />
          <TextField
            fullWidth
            id={'server'}
            name={'server'}
            label={'Server a rejoindre (optionnel)'}
          />
          <Button
            type={'submit'}
            fullWidth
            variant={'contained'}
            sx={{mt: 3, mb: 2}}>
            Me connecter
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
