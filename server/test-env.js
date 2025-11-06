require('dotenv').config();

console.log('=== ENVIRONMENT VARIABLE DEBUG ===');
console.log('Raw token from process.env:', process.env.MOCEAN_API_TOKEN);
console.log('Token length:', process.env.MOCEAN_API_TOKEN?.length);
console.log('Token bytes:', Buffer.from(process.env.MOCEAN_API_TOKEN || '').toString('hex'));
console.log('Expected token: apit-kuqpkmRDLitxlul26lTs3ThLAVDksx4C-PlRXv');
console.log('Expected length: 48');

const expected = 'apit-kuqpkmRDLitxlul26lTs3ThLAVDksx4C-PlRXv';
const actual = process.env.MOCEAN_API_TOKEN || '';

console.log('\n=== CHARACTER COMPARISON ===');
for (let i = 0; i < Math.max(expected.length, actual.length); i++) {
    if (expected[i] !== actual[i]) {
        console.log(`Position ${i}: Expected '${expected[i]}' but got '${actual[i]}'`);
        if (i >= actual.length) {
            console.log(`TOKEN IS TRUNCATED AT POSITION ${i}!`);
            break;
        }
    }
}