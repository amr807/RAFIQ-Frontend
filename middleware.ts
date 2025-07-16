import { NextResponse, NextRequest } from 'next/server'

const loggedOutRoutes = ["/login","/signup","/","/my-account","/my-account/User"]
const loggedInRoutes = "/my-account"

function isAuthenticated(request: NextRequest) {
  const cookies=request.cookies.get("next-auth.session-token")?.value &&request.cookies.get("refresh_token")?.value
 if(!!cookies){
  request.cookies.clear()
 }
  return !!cookies
}


 
  
export async function middleware(req: NextRequest) {
  const isLoggedIn = isAuthenticated(req)
  
  const { pathname } = req.nextUrl.clone()
  console.log( loggedOutRoutes.includes(pathname),isLoggedIn)
  

  if( isLoggedIn && loggedOutRoutes.includes(pathname)){ 
    const dashboardPath =   "/my-account/User/dashboard"

    return NextResponse.redirect(new URL(dashboardPath, req.url));

  }


  if(!isLoggedIn && pathname.startsWith(loggedInRoutes)){
   const response = NextResponse.redirect(new URL("/login",req.url),302)

response.cookies.delete('refresh_token')
response.cookies.delete('access_token')
response.cookies.delete('next-auth.session-token')
   return response
  }
 console.log("middleware=>",pathname.includes("/my-account/"),isLoggedIn)

 return NextResponse.next()
}
export const config = {
  matcher: "/:path*",
}