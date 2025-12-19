import { useQuery } from "@apollo/client/react";
import { GetSitiesDocument } from "./graphql/types/__generated__/graphql.ts";

function App() {

  const { loading, error, data } = useQuery(GetSitiesDocument);
  

  
  if (!loading) {
    console.log(data?.cities)
  }
  return (
    <h1>Hello</h1>
  )


}

export default App
