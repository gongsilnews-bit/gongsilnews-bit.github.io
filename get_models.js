const K = "AIzaSyCkB_55N7V9w1267m3ozCdC-091byCo13A";
fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + K)
  .then(r => r.json())
  .then(data => {
    if(data.models) {
      const flash = data.models.filter(m => m.name.includes('flash'));
      require('fs').writeFileSync('available_models.txt', flash.map(m => m.name).join('\n'));
      console.log('Saved models to available_models.txt');
    } else {
      console.error(data);
    }
  });
