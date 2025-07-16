export default async  function Updatepin(email:string,pin:string){
    try{
const res=await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/editpin`,{
method:"PUT",
headers:{      'Content-Type': 'application/json',
},
    body:JSON.stringify({email:email,newPassword:pin})
}


)
const data=await res.json()
if(res.status==200){
    return data
}

else{
    return null

}
    }catch(err){

        console.error('There was a problem with the fetch operation:', err);

    }

}