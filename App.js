import "intl-pluralrules";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, useIsFocused } from "@react-navigation/native";
import { useTranslation, initReactI18next } from "react-i18next";
import i18n from "i18next";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(129, 194, 255, 0.56)",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  success: {
    color: "green",
    marginTop: 8,
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
  },
  expenseDate: {
    fontSize: 12,
    color: "gray",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 16,
  },
  deleteButton: {
    color: "red",
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: "gray",
    marginVertical: 4,
  },
  sectionSeparator: {
    height: 8,
    backgroundColor: "#f5f5f5",
  },
  languageButtonText: {
    fontSize: 18,
  },
});

const ExpenseListScreen = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const [expenses, setExpenses] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    loadExpenses();
  }, [isFocused]);

  const loadExpenses = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem("expenses");
      if (savedExpenses !== null) {
        const parsedExpenses = JSON.parse(savedExpenses);
        const sortedExpenses = parsedExpenses.sort(
          (a, b) => b.createdTime - a.createdTime
        );
        setExpenses(sortedExpenses);
      }
    } catch (error) {
      console.log("Error loading expenses:", error);
    }
  };

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseName}>{item.name}</Text>
        <Text style={styles.expenseDate}>
          {getDateFromTimestamp(item.createdTime)}
        </Text>
      </View>
      <Text style={styles.expenseAmount}>${item.amount}</Text>
      <TouchableOpacity onPress={() => deleteExpense(item.id)}>
        <Text style={styles.deleteButton}>{t("delete")}</Text>
      </TouchableOpacity>
    </View>
  );

  const keyExtractor = (item, index) => index.toString();

  const isSameSection = (prevItem, currentItem) => {
    const prevDate = getDateFromTimestamp(prevItem.createdTime);
    const currentDate = getDateFromTimestamp(currentItem.createdTime);
    return prevDate === currentDate;
  };

  const deleteExpense = async (expenseId) => {
    try {
      const savedExpenses = await AsyncStorage.getItem("expenses");
      if (savedExpenses !== null) {
        const expenses = JSON.parse(savedExpenses);
        const updatedExpenses = expenses.filter(
          (expense) => expense.id !== expenseId
        );
        await AsyncStorage.setItem("expenses", JSON.stringify(updatedExpenses));
        setExpenses(updatedExpenses);
      }
    } catch (error) {
      console.log("Error deleting expense:", error);
    }
  };

  const totalExpense = expenses.reduce(
    (total, expense) => total + parseFloat(expense.amount),
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t("expenseList")}</Text>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => changeLanguage("en")}
      >
        <Text style={styles.languageButtonText}>English</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => changeLanguage("bn")}
      >
        <Text style={styles.languageButtonText}>বাংলা</Text>
      </TouchableOpacity>
      <Text style={styles.totalExpense}>
        {t("totalExpense")}: ${totalExpense.toFixed(2)}
      </Text>

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        extraData={expenses}
        sectionSeparatorComponent={({ leadingItem }) =>
          !isSameSection(leadingItem, leadingItem.next) && (
            <View style={styles.sectionSeparator} />
          )
        }
        ListEmptyComponent={()=> <Text style={{textAlign: "center"}}>No Entry</Text>}
      />
    </SafeAreaView>
  );
};

const AddExpenseScreen = () => {
  const { t } = useTranslation();

  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const addExpense = async () => {
    const newExpense = {
      id: new Date().getTime(),
      name: expenseName,
      amount: expenseAmount,
      createdTime: new Date().getTime(),
    };
    try {
      const savedExpenses = await AsyncStorage.getItem("expenses");
      let expenses = [];
      if (savedExpenses !== null) {
        expenses = JSON.parse(savedExpenses);
      }
      expenses.push(newExpense);
      await AsyncStorage.setItem("expenses", JSON.stringify(expenses));
      setExpenseName("");
      setExpenseAmount("");
      setSuccessMessage(t("expenseAdded"));
      setTimeout(() => setSuccessMessage(""), 2000); // Clear the success message after 3 seconds
    } catch (error) {
      console.log("Error saving expense:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("addExpense")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("expenseName")}
        value={expenseName}
        onChangeText={(text) => setExpenseName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder={t("expenseAmount")}
        value={expenseAmount}
        onChangeText={(text) => setExpenseAmount(text)}
        keyboardType="numeric"
      />
      <Button title={t("addExpense")} onPress={addExpense} />
      {successMessage !== "" && (
        <Text style={styles.success}>{successMessage}</Text>
      )}
    </View>
  );
};

const IncomeScreen = () => {
  const { t } = useTranslation();

  const [incomeName, setIncomeName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const addIncome = async () => {
    const newIncome = {
      id: new Date().getTime(),
      name: incomeName,
      amount: incomeAmount,
      createdTime: new Date().getTime(),
    };
    try {
      const savedIncomes = await AsyncStorage.getItem("incomes");
      let incomes = [];
      if (savedIncomes !== null) {
        incomes = JSON.parse(savedIncomes);
      }
      incomes.push(newIncome);
      await AsyncStorage.setItem("incomes", JSON.stringify(incomes));
      setIncomeName("");
      setIncomeAmount("");
      setSuccessMessage(t("incomeAdded"));
      setTimeout(() => setSuccessMessage(""), 3000); // Clear the success message after 3 seconds
    } catch (error) {
      console.log("Error saving income:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("addIncome")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("incomeName")}
        value={incomeName}
        onChangeText={(text) => setIncomeName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder={t("incomeAmount")}
        value={incomeAmount}
        onChangeText={(text) => setIncomeAmount(text)}
        keyboardType="numeric"
      />
      <Button title={t("addIncome")} onPress={addIncome} />
      {successMessage !== "" && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}
    </View>
  );
};

const TransactionListScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem("expenses");
      const savedIncomes = await AsyncStorage.getItem("incomes");
      let expenses = [];
      let incomes = [];
      if (savedExpenses !== null) {
        expenses = JSON.parse(savedExpenses).map((expense) => ({
          ...expense,
          type: "expense",
        }));
      }
      if (savedIncomes !== null) {
        incomes = JSON.parse(savedIncomes).map((income) => ({
          ...income,
          type: "income",
        }));
      }
      const allTransactions = [...expenses, ...incomes];
      allTransactions.sort((a, b) => b.createdTime - a.createdTime);
      setTransactions(allTransactions);
    } catch (error) {
      console.log("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    const focusListener = navigation.addListener("focus", fetchTransactions);

    return () => {
      // focusListener.remove();
    };
  }, [navigation]);

  const renderTransactionItem = ({ item }) => {
    const { name, amount, type } = item;
    const formattedAmount = type === "expense" ? "-" + amount : "+" + amount;

    return (
      <View style={styles.transactionItem}>
        <Text style={styles.transactionName}>{name}</Text>
        <Text style={styles.transactionAmount}>{formattedAmount}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onRefresh={fetchTransactions}
        refreshing={false} // Set to true if you want to show a loading indicator while refreshing
        ListEmptyComponent={()=> <Text style={{textAlign: "center"}}>No Entry</Text>}
      />
    </View>
  );
};

const App = () => {
  const { t } = useTranslation();
  return (
    <NavigationContainer>
      <PaperProvider theme={DefaultTheme}>
        <Tab.Navigator>
          <Tab.Screen
            name="ExpenseList"
            component={ExpenseListScreen}
            options={{
              title: t("expenseList"),
              tabBarIcon: ({ color, size }) => (
                <Icon name="list" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="AddExpense"
            component={AddExpenseScreen}
            options={{
              title: t("addExpense"),
              tabBarIcon: ({ color, size }) => (
                <Icon name="add" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name={i18n.t("addIncome")}
            component={IncomeScreen}
            options={{
              title: t("addIncome"),
              tabBarIcon: ({ color, size }) => (
                <Icon name="add" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name={i18n.t("transactionList")}
            component={TransactionListScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="list" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </PaperProvider>
    </NavigationContainer>
  );
};

// Helper function to convert a timestamp to a formatted date
const getDateFromTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  if (isNaN(date)) {
    return "Invalid Date";
  }
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
};

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        expenseList: "Expense List",
        addExpense: "Add Expense",
        expenseName: "Expense Name",
        expenseAmount: "Expense Amount",
        addExpense: "Add Expense",
        delete: "Delete",
        totalExpense: "Total Expense",
        expenseAdded: "Expense added successfully!",
        addIncome: "Add Income",
      },
    },
    bn: {
      translation: {
        expenseList: "ব্যয় তালিকা",
        addExpense: "ব্যয় যোগ করুন",
        expenseName: "ব্যয়ের নাম",
        addIncome: "আয় যোগ করুন",
        expenseAmount: "ব্যয়ের পরিমাণ",
        addExpense: "ব্যয় যোগ করুন",
        delete: "মুছে ফেলুন",
        totalExpense: "মোট ব্যয়",
        expenseAdded: "ব্যয় সফলভাবে যোগ করা হয়েছে!",
      },
    },
  },
  lng: "en",
  fallbackLng: "bn",
});

export default App;
