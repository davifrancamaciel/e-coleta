import express from 'express'
import path from 'path'
import cors from 'cors'
import {errors} from 'celebrate'

import routes from './routes'
import { BASE_PORT } from './constants/config'

const app = express()

app.use(cors())
app.use(express.json())
app.use(routes)

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))

app.use(errors())

app.listen(BASE_PORT, () => {
  console.log(`[*] Server running on port: ${BASE_PORT}`)
})
