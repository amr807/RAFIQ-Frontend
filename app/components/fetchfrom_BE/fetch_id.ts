export async function FindId(email:string){
const res=await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/Managerid`,{
    headers: {
        "Content-Type": "application/json",
      },
  method:"POST",
    body:JSON.stringify({email:email})
})

const data=await res.json()
if(res.status==201){
    return  await data.id
}
else{
    return null
}

}