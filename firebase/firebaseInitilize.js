
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyDTxFpiVfurClz-KY6jaHPFf-MqvnVEt5g",
    authDomain: "commercejs-project.firebaseapp.com",
    projectId: "commercejs-project",
    storageBucket: "commercejs-project.appspot.com",
    messagingSenderId: "999344917198",
    appId: "1:999344917198:web:a6973149ad92b8cd229e9f",
    measurementId: "G-Y70QDVQZBM"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
