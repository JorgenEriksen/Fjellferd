


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://james123:bond123@cluster0-n50dj.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
    if(err) {
        console.log('Error ved oppkobling til MongoDB Atlas...\n',err);
   }
   console.log('Koblet til!');


  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  console.log(collection);
  client.close();
});