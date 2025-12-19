import { gql } from "@apollo/client"
import { useQuery } from "@apollo/client/react";

const GET_СITY = gql`
  query GetSities {
    cities {
      name
    }
  }
`;

function App() {

  const { loading, error, data } = useQuery(GET_СITY);

  
  if (!loading) {
    console.log(data.cities)
  }
  return (
    <h1>Hello</h1>
  )


}

export default App
