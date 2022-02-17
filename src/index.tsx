import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import {createTheme, ThemeProvider} from '@mui/material/styles'

import reportWebVitals from './reportWebVitals'

import './index.css'
import App from './Router'

function Main() {
  const theme = createTheme()

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}

ReactDOM.render(Main(), document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
