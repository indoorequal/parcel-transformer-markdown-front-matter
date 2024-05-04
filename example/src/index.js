import markdown from './myfile.md';

document.body.innerHTML = markdown.__content;
document.title = markdown.title;
