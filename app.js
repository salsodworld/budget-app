// BUDGET CONTROLLER
let budgetController = (function () {
    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
  
    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let calculateTotal = function(type){
        let sum = 0;

        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        })
        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val){
            let newItem, ID;
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new Item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        CalculateBudget: function(){
            // 1. Calculate total income and expenses
            calculateTotal('exp')
            calculateTotal('inc')

            // 2. Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // 3. Calculate the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function(){
            let allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPerc;
        },

        deleteItem: function(type, id){
            let ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        testing: function (){
            console.log(data)
        }
    }


})();



// UI CONTROLLER 
let UIController = (function() {


    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    let formatNumber = function(num, type){
        let numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }


        dec = numSplit[1];

        return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;
    };

    let nodeListForEach = function(list, callback){
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Will either be inc or dec.
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItems: function(obj, type){
            // Create HTML string with placeholder text
            let html, newHtml, element;

            if(type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><p class="item__description">%description%</p><div class="right clearfix"><p class="item__value">%value%</p><div class="item__delete"><button class="item__delete--btn"><span class="material-icons cancel">highlight_off</span></button></div></div></div>';
            } else if(type === 'exp') {
                element = DOMStrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><p class="item__description">%description%</p><div class="right clearfix"><p class="item__value">%value%</p><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><span class="material-icons cancel">highlight_off</span></button></div></div></div>'
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        clearFields: function(){
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(element => {
                element.value = ' ';
            });

            fieldsArr[0].focus()
        },

        deleteListItems: function(selectorID){
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayBudget: function (obj){
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayDate: function (){
            
            let now, months, month, currentMonth, year;

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            currentMonth = months[month];

            document.querySelector(DOMStrings.dateLabel).textContent = currentMonth + ' ' + year;
        },

        displayPercentages: function(percentages){
            let fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(current,index){

                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else{
                    current.textContent = '---';
                }
            });
        },

        changedType: function (){

            let fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + 
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
                )

                nodeListForEach(fields, function(cur){
                    cur.classList.toggle('red-focus');
                });
                document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function (){
            return DOMStrings;
        }
    }
})();




// GLOBAL APP CONTROLLER

let controller = (function(budgetCtrl, UICtrl) {

    let setupEventListener = function() {
        let DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function(event) {
            if ( event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
 
    }

    let updateBudget = function() {
        // 1. Calculate the budget 
        budgetCtrl.CalculateBudget()
        // 2. Return the budget 
        let budget = budgetCtrl.getBudget()
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget)
    }

    let updatePercentages = function (){
        // 1. calculate percentages

        budgetCtrl.calculatePercentages()
        // 2. calculate percentages from the budget controller

        let percentages = budgetCtrl.getPercentages()
        // 3. Update the UI with the new percentages

        UICtrl.displayPercentages(percentages)
    }

    let ctrlAddItem = function() {
        let input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== ' ' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)
            // 3. Add the item to the UI controller
            UICtrl.addListItems(newItem, input.type)

            // 4. Clear the fields
            UICtrl.clearFields()
            
            // 5. Calculate and Update Budget
            updateBudget();

            // 6. calculate and update percentages
            updatePercentages()

        }
    };

    let ctrlDeleteItem = function (event){
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {

            // inc-1

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the Data Structure
            budgetCtrl.deleteItem(type, ID)

            // 2. Delete the item from the UI

            UICtrl.deleteListItems(itemID)
            // 3. Update and show the new budget
            updateBudget();

             // 4. calculate and update percentages
            updatePercentages()

        }

    }

    return {
        init: function (){
            console.log('Application started')
            UICtrl.displayDate()
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListener();
        }
    }

})(budgetController, UIController);

controller.init();