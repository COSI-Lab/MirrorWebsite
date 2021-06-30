window.onload = function() {
  fetch("https://dubsdot.cslabs.clarkson.edu/cosi-nav.json")
    .then(res => res.json())
    .then(json => {
      fetch("https://dubsdot.cosi.clarkson.edu/cosi-nav.css")
        .then(res => res.text())
        .then(css => {
          let style = document.createElement("style");
          style.innerText = css;
          document.head.appendChild(style);

          let links = json.links;
          let linkList = document.querySelector("cosi-nav");
          links.forEach(link => {
            let newLink = document.createElement("li");
            newLink.innerHTML = `<a href="${link.url}">${link.name}</a>`;
            linkList.appendChild(newLink);
          });
        });
    });
};
