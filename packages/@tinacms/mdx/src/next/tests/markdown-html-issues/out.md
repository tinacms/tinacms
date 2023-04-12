To fetch our pets from the server, we need to write queries that request the **exact fields** that we want. Head over to `client/src/pages/Pets.js`, and copy and paste the following code into it:

<div class="break-out">
<pre><code class="language-javascript">import React, {useState} from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'</code>

<code class="language-javascript" style="background-color: #fffbd7">const GET\_PETS = gql`  query getPets {
    pets {
      id
      name
      type
      img
    }
  }`;</code>

<code class="language-javascript">export default function Pets () {
const \[modal, setModal] = useState(false)</code> <code class="language-javascript" style="background-color: #fffbd7"> const { loading, error, data } = useQuery(GET\_PETS);

if (loading) return \<Loader />;

if (error) return \<p>An error occured!\</p>;</code>

<code class="language-javascript"> const onSubmit = input => {
setModal(false)
}

if (modal) {
return \<NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />
}
return (
\<div className="page pets-page">
\<section>
\<div className="row betwee-xs middle-xs">
\<div className="col-xs-10">
\<h1>Pets\</h1>
\</div>
\<div className="col-xs-2">
\<button onClick={() => setModal(true)}>new pet\</button>
\</div>
\</div>
\</section>
\<section></code> <code class="language-javascript" style="background-color: #fffbd7"> \<PetsList pets={data.pets}/></code> <code class="language-javascript"> \</section>
\</div>
)
} </code></pre>

</div>
