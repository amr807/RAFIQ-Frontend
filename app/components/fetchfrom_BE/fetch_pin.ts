

export default async  function fetchpin(email:string){
    try{
const res=await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/getpin`,{
method:"POST",
headers:{      'Content-Type': 'application/json',
},
    body:JSON.stringify({email:email})
}


)
const data=await res.json()
if(res.status==201){
    return data
}

else{
    return null

}
    }catch(err){

        console.error('There was a problem with the fetch operation:', err);

    }

}


