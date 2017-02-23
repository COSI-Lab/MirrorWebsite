fetch('https://dubsdot.cslabs.clarkson.edu/cosi-nav.json')
    .then(res => res.json())
    .then(json => {
        let links = json.links;
        let linkList = document.querySelector('cosi-nav');
        links.forEach(link => {
            let newLink = document.createElement('li');
            newLink.innerHTML = `<a href="${link.url}">${link.name}</a>`;
            linkList.appendChild(newLink);
        });
    });