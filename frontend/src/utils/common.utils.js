export const dateUtils = {
  formatDate: (date, format = "DD-MM-YYYY") => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    if (format === "DD-MM-YYYY") return `${day}-${month}-${year}`;
    if (format === "YYYY-MM-DD") return `${year}-${month}-${day}`;
    return date.toString();
  },

  parseDate: (dateString, format = "DD-MM-YYYY") => {
    if (!dateString) return null;

    let day, month, year;

    if (format === "DD-MM-YYYY") {
      [day, month, year] = dateString.split("-");
    } else if (format === "YYYY-MM-DD") {
      [year, month, day] = dateString.split("-");
    }

    return new Date(year, month - 1, day);
  },

  getDaysDifference: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  isDatePast: (dateString) => {
    const date = dateUtils.parseDate(dateString);
    return date < new Date();
  },

  isDateToday: (dateString) => {
    const date = dateUtils.parseDate(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },
};

export const currencyUtils = {
  format: (amount, currency = "₹") => {
    return `${currency}${Number(amount).toLocaleString("en-IN")}`;
  },

  parse: (formattedAmount) => {
    return parseFloat(formattedAmount.replace(/[^0-9.-]+/g, ""));
  },

  calculate: {
    total: (items) => items.reduce((sum, item) => sum + (item.price || 0), 0),
    average: (items) => {
      const total = currencyUtils.calculate.total(items);
      return items.length > 0 ? total / items.length : 0;
    },
  },
};

export const stringUtils = {
  capitalize: (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  truncate: (str, maxLength) => {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength) + "...";
  },

  generateId: () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  toSlug: (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  displayId: (id, prefix = "", paddingLength = 3) => {
    return `${prefix}-${String(id).padStart(paddingLength, "0")}`;
  },
};

export const validationUtils = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidMobile: (mobile) => {
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobile);
  },

  isValidDate: (dateString, format = "DD-MM-YYYY") => {
    const date = dateUtils.parseDate(dateString, format);
    return date instanceof Date && !isNaN(date);
  },

  isValidAmount: (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  },

  isValidName: (name) => {
    return name && name.trim().length >= 2;
  },

  isPasswordStrong: (password) => {
    return (
      password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password)
    );
  },
};

export const arrayUtils = {
  unique: (arr, key = null) => {
    if (key) {
      return arr.filter(
        (item, index, self) =>
          self.findIndex((t) => t[key] === item[key]) === index,
      );
    }
    return [...new Set(arr)];
  },

  groupBy: (arr, key) => {
    return arr.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  },

  sortBy: (arr, key, order = "asc") => {
    return [...arr].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      return order === "asc" ? aVal - bVal : bVal - aVal;
    });
  },

  findDifference: (arr1, arr2, key = null) => {
    if (key) {
      const ids2 = arr2.map((item) => item[key]);
      return arr1.filter((item) => !ids2.includes(item[key]));
    }
    return arr1.filter((item) => !arr2.includes(item));
  },
};

export const objectUtils = {
  isEmpty: (obj) => {
    return Object.keys(obj).length === 0;
  },

  pick: (obj, keys) => {
    return keys.reduce((result, key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  omit: (obj, keys) => {
    return Object.keys(obj)
      .filter((key) => !keys.includes(key))
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  },

  merge: (target, source) => {
    return { ...target, ...source };
  },
};

export const storageUtils = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Storage set error:", error);
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Storage get error:", error);
      return null;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Storage remove error:", error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Storage clear error:", error);
    }
  },
};

export const numberUtils = {
  isInteger: (value) => {
    return Number.isInteger(value);
  },

  clamp: (value, min, max) => {
    return Math.max(min, Math.min(max, value));
  },

  percentage: (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(2) : 0;
  },

  round: (value, decimals = 2) => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },
};
