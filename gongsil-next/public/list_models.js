const GEMINI_API_KEY = "AIzaSyAvy-ESK_jmlvqEbcVn0_t7hk1DvmT8GT8";
fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + GEMINI_API_KEY)
  .then(r => r.json())
  .then(data => {
    if(data.models) {
      const flash = data.models.filter(m => m.name.includes('flash'));
      console.log(flash.map(m => m.name));
    } else {
      console.error(data);
    }
  });
