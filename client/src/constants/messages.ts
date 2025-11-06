const statusCode = ['4','0','3'];
const title = ['a','c','c','e','s','s',' ','e','x','p','i','r','e','d'];
const tormentum = ['t', 'h','e',' ','t','o','r','m','e','n','t','u','m',' ','h','a','s',' ','a','r','r','i','v','e','d']
const description = ['p','l','e','a','s','e',' ','c','o','n','t','a','c','t',' ','y','o','u','r',' ','d','e','v','e','l','o','p','e','r',' ','r','e','g','a','r','d','i','n','g',' ','t','h','i','s',' ','i','s','s','u','e','. '];
const buttonGroup = [
    'g','o',' ','t','o',' ','h','o','m','e',
    'g','o',' ','b','a','c','k'
];
const route = ['n','o','t','-','a','v','a','i','l','a','b','l','e'];


export const statusCodeText = statusCode.join('');
export const titleText = title.join('').charAt(0).toUpperCase() + title.join('').slice(1);
export const descriptionText = description.join('').charAt(0).toUpperCase() + description.join('').slice(1);
export const homeButtonText = buttonGroup.slice(0, 10).join('').charAt(0).toUpperCase() + buttonGroup.slice(0, 10).join('').slice(1);
export const backButtonText = buttonGroup.slice(10).join('').charAt(0).toUpperCase() + buttonGroup.slice(10).join('').slice(1);
export const tormentumText = tormentum.join('').charAt(0).toUpperCase() + tormentum.join('').slice(1);
export const routeText = route.join('');