
export default function createTitleBlock(main, document) {
  /*
    search
  */

  // TODO - render proper search section/block
  var sEl = document.querySelector('#search-container');
  if (sEl) sEl.remove();

  sEl = document.querySelector('.back-to-search');
  if (sEl) sEl.remove();

  /*
    title
  */

 
 const el = document.querySelector('h1.page-title');
 if (el) {
    let title = el.textContent;
  
    const div = document.createElement('h1');
    div.innerHTML = title;
    
    const cells = [
      ['Section Metadata'],
      ['style', 'dark, xs spacing, page-title'],
    ];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    
    document.body.prepend(document.createElement('hr'));
    document.body.prepend(table);
    document.body.prepend(div);
  
    el.remove();
  }
}
