
import path from 'path';

export function buildPathAndFilenameWithPathFromUrl(url, suffix = '', extension = 'html') {
  let u = new URL(url);
  let p = path.parse(u.pathname); // path
  let f = ''; // filename

  if (u.pathname.lastIndexOf('/') === u.pathname.length - 1) {
    p.name = '___';
  }

  if (suffix) {
    p.name += '.' + suffix;
  }

  const matches = /.*\.?htm.*$/.exec(p.base);

  if (!matches) {
    p.ext = '.html';
  }

  if (extension !== 'html') {
    p.ext = '.' + extension;
  }

  return [p.dir, p.name+p.ext];
}

export function buildFilenameWithPathFromUrl(url, suffix = '', extension = 'html') {
  const res = buildPathAndFilenameWithPathFromUrl(url, suffix, extension)
  return path.join(...res);
}

export function sanitizeURL(url) {
  try {
    const u = new URL(url);
    let s = u.origin + u.pathname;
    s = s.replaceAll(/[\/.,:]/g, '_');
    return s;
  } catch(e) {
    throw new Error(`: ${e}`);
  }
}