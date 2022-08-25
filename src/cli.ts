import { Args } from "./types";
import inquirer from "inquirer";
import figlet from "figlet";
// create shortcut per lanciare automaticamente il download 
// --all e scarica tutti i profili
// --outDir <percorso o "."> per esportare in un determinato percorso o quello corrente
// 
export function cli(args: Args) {
	console.log('TS', args);
  // getProfile()

  const questions = [
    {
      type: 'confirm',
      name: 'toBeDelivered',
      message: 'Is this for delivery?',
      default: false,
    },
    {
      type: 'input',
      name: 'phone',
      message: "What's your phone number?",
      validate(value:any) {
        const pass = value.match(
          /^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i
        );
        if (pass) {
          return true;
        }

        return 'Please enter a valid phone number';
      },
    },
    {
      type: 'list',
      name: 'size',
      message: 'What size do you need?',
      choices: ['Large', 'Medium', 'Small'],
      filter(val:any) {
        return val.toLowerCase();
      },
    },
    {
      type: 'input',
      name: 'quantity',
      message: 'How many do you need?',
      validate(value:any) {
        const valid = !isNaN(parseFloat(value));
        return valid || 'Please enter a number';
      },
      filter: Number,
    },
    {
      type: 'expand',
      name: 'toppings',
      message: 'What about the toppings?',
      choices: [
        {
          key: 'p',
          name: 'Pepperoni and cheese',
          value: 'PepperoniCheese',
        },
        {
          key: 'a',
          name: 'All dressed',
          value: 'alldressed',
        },
        {
          key: 'w',
          name: 'Hawaiian',
          value: 'hawaiian',
        },
      ],
    },
    {
      type: 'rawlist',
      name: 'beverage',
      message: 'You also get a free 2L beverage',
      choices: ['Pepsi', '7up', 'Coke'],
    },
    {
      type: 'input',
      name: 'comments',
      message: 'Any comments on your purchase experience?',
      default: 'Nope, all good!',
    },
    {
      type: 'list',
      name: 'prize',
      message: 'For leaving a comment, you get a freebie',
      choices: ['cake', 'fries'],
      when(answers:any) {
        return answers.comments !== 'Nope, all good!';
      },
    },
  ];

  figlet(`Bookmarks 
  Manager!!`, function(err, data) {
      if (err) {
          console.log('Something went wrong...');
          console.dir(err);
          return;
      }
      console.log(data)
      console.log('Ciao, e benvenuto al tool che ti permette di avere un resoconto su tutti i tuoi bookmark ');

      inquirer.prompt(questions).then((answers:any) => {
        console.log('\nOrder receipt:');
        console.log(JSON.stringify(answers, null, '  '));
      });
  });
}

