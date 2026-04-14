const fs = require('fs');
['03-microservices.yaml', '04-frontend.yaml'].forEach(file => {
   const path = `c:/Users/user/Downloads/healthcare-platform/k8s/local/${file}`;
   let content = fs.readFileSync(path, 'utf8');
   content = content.replace(/registry\.digitalocean\.com\/synapscare-registry\//g, 'synapscare/');
   content = content.replace(/imagePullPolicy: Always/g, 'imagePullPolicy: IfNotPresent');
   fs.writeFileSync(path, content);
});
console.log("Local manifests updated successfully.");
