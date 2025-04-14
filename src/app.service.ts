import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return `<!doctype html>
    <html><head><title>test</title></head>
    <body>
    <script>
      const getCalendars = async () => {
        const res = await fetch(
          'http://localhost:4000/google-server-oauth/calendars',
          {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            }
          }
        )

        document.getElementById('calendars').innerHTML = res.status == 200 ? (await res.text()) : 'error'

        return true
      }
    </script>
    <a href="http://localhost:4000/google-server-oauth/auth">sign in with Google</a>
    <a onclick="event.preventDefault(); getCalendars()" href="#">Get Calendars</a>
    <div id="calendars"></div>
    </body></html>`
  }
}
