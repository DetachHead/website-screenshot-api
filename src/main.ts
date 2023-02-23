import { app, port } from './server'

app.listen(port, () => console.log(`listening at http://localhost:${port}`))
