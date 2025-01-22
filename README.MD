# Expense Tracker

## Implementation Plan


### Implement functionality to add, edit, and delete expenses using JavaScript.

The user should has the option to chose an existing month or create a new one. We can add, delete and list days using the structure bellow:

Key: dates
Data: JSON.stringify

```json
["month/year"]
```

Once the user has chose the month we can allow him to add, delete and edit expenses using the structure bellow:

Key: month/year (Ex. 01/2025)
Data: JSON.stringify

```json
{
  "income": 10000,
  "budget": {
    "food": 1000
  },
  "expenses": [
    {
      "id": "aaa",
      "amount": 100,
      "category": "food",
      "description": "Cactus Club Cafe",
      "date": "01/01/2025"
    }
  ],
  "resume": {
    "total": "1000",
    "category": {
      "food": 100
    }
  }
}
```

Everytime a user add, edit or delete a new expense we should update the "expenses" array and also recalculate the resume object with the new resume of the total expenses.

To be able to check if the user hit the total budget for the category we can check the resume total amount for the category x the budget set for the category.
