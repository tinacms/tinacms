To fetch our pets from the server, we need to write queries that request the **exact fields** that we want. Head over to `client/src/pages/Pets.js`, and copy and paste the following code into it:

<div class="break-out">
<pre><code class="language-javascript">import React, {useState} from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'</code>

<code class="language-javascript" style="background-color: #fffbd7">const GET_PETS = gql`  query getPets {
    pets {
      id
      name
      type
      img
    }
  }`;</code>

<code class="language-javascript">export default function Pets () {
const [modal, setModal] = useState(false)</code>
<code class="language-javascript" style="background-color: #fffbd7"> const { loading, error, data } = useQuery(GET_PETS);

if (loading) return &lt;Loader /&gt;;

if (error) return &lt;p&gt;An error occured!&lt;/p&gt;;</code>

<code class="language-javascript"> const onSubmit = input =&gt; {
setModal(false)
}

if (modal) {
return &lt;NewPetModal onSubmit={onSubmit} onCancel={() =&gt; setModal(false)} /&gt;
}
return (
&lt;div className="page pets-page"&gt;
&lt;section&gt;
&lt;div className="row betwee-xs middle-xs"&gt;
&lt;div className="col-xs-10"&gt;
&lt;h1&gt;Pets&lt;/h1&gt;
&lt;/div&gt;
&lt;div className="col-xs-2"&gt;
&lt;button onClick={() =&gt; setModal(true)}&gt;new pet&lt;/button&gt;
&lt;/div&gt;
&lt;/div&gt;
&lt;/section&gt;
&lt;section&gt;</code>
<code class="language-javascript" style="background-color: #fffbd7"> &lt;PetsList pets={data.pets}/&gt;</code>
<code class="language-javascript"> &lt;/section&gt;
&lt;/div&gt;
)
}
</code></pre>

</div>
