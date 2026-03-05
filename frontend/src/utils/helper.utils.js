import { stringUtils, validationUtils } from "./common.utils.js";

export const formUtils = {
  validateField: (fieldName, value, rules = {}) => {
    const fieldRules = rules[fieldName] || [];

    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) return error;
    }

    return null;
  },

  validateForm: (formData, rules) => {
    const errors = {};

    Object.keys(rules).forEach((fieldName) => {
      const error = formUtils.validateField(
        fieldName,
        formData[fieldName],
        rules,
      );
      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  },

  rules: {
    required:
      (fieldName = "This field") =>
      (value) => {
        if (!value || (typeof value === "string" && !value.trim())) {
          return `${fieldName} is required`;
        }
        return null;
      },

    email: (value) => {
      if (value && !validationUtils.isValidEmail(value)) {
        return "Invalid email address";
      }
      return null;
    },

    minLength: (min) => (value) => {
      if (value && value.length < min) {
        return `Minimum ${min} characters required`;
      }
      return null;
    },

    maxLength: (max) => (value) => {
      if (value && value.length > max) {
        return `Maximum ${max} characters allowed`;
      }
      return null;
    },

    mobile: (value) => {
      if (value && !validationUtils.isValidMobile(value)) {
        return "Invalid mobile number (10 digits required)";
      }
      return null;
    },

    amount: (value) => {
      if (value && !validationUtils.isValidAmount(value)) {
        return "Amount must be a positive number";
      }
      return null;
    },

    passwordStrength: (value) => {
      if (value && !validationUtils.isPasswordStrong(value)) {
        return "Password must be at least 8 characters with letters and numbers";
      }
      return null;
    },

    match: (fieldToMatch, fieldToMatchLabel) => (value, allFormData) => {
      if (value && value !== allFormData[fieldToMatch]) {
        return `Must match ${fieldToMatchLabel}`;
      }
      return null;
    },
  },

  reset: (initialValues) => {
    return JSON.parse(JSON.stringify(initialValues));
  },

  hasErrors: (errors) => {
    return Object.values(errors).some(
      (error) => error !== null && error !== "",
    );
  },
};

export const classNameBuilder = {
  build: (...classes) => {
    return classes
      .filter((cls) => typeof cls === "string" && cls.trim() !== "")
      .join(" ")
      .trim();
  },

  conditional: (condition, trueClass, falseClass = "") => {
    return condition ? trueClass : falseClass;
  },

  merge: (baseClasses, conditionalClasses) => {
    const allClasses = { ...baseClasses, ...conditionalClasses };
    return classNameBuilder.build(...Object.values(allClasses));
  },
};

export const messageUtils = {
  getErrorMessage: (error) => {
    if (typeof error === "string") return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return "An error occurred. Please try again.";
  },

  getSuccessMessage: (action) => {
    const messages = {
      create: "Created successfully",
      update: "Updated successfully",
      delete: "Deleted successfully",
      save: "Saved successfully",
      submit: "Submitted successfully",
      fetch: "Loaded successfully",
    };
    return messages[action] || "Operation completed successfully";
  },

  getConfirmationMessage: (action, itemName) => {
    const messages = {
      delete: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      update: `Save changes to this ${itemName}?`,
      create: `Create new ${itemName}?`,
    };
    return (
      messages[action] || `Are you sure you want to ${action} this ${itemName}?`
    );
  },
};

export const fileUtils = {
  isValidFile: (
    file,
    maxSizeMB = 5,
    allowedTypes = ["image/jpeg", "image/png"],
  ) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File must be smaller than ${maxSizeMB}MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      };
    }

    return { valid: true };
  },

  getFilePreview: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);

      reader.readAsDataURL(file);
    });
  },

  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  },

  downloadFile: (data, filename, mimeType = "application/octet-stream") => {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  },
};

export const dataUtils = {
  searchInArray: (array, searchQuery, searchFields) => {
    if (!searchQuery) return array;

    const query = searchQuery.toLowerCase();

    return array.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(query);
      }),
    );
  },

  filterByStatus: (array, status, statusField = "status") => {
    if (!status) return array;
    return array.filter((item) => item[statusField] === status);
  },

  sortArray: (array, sortKey, sortOrder = "asc") => {
    return [...array].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });
  },

  paginateArray: (array, page, pageSize) => {
    const start = (page - 1) * pageSize;
    return array.slice(start, start + pageSize);
  },

  getTotalPages: (totalItems, pageSize) => {
    return Math.ceil(totalItems / pageSize);
  },
};

export const domUtils = {
  scrollToElement: (elementId, behavior = "smooth") => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior });
    }
  },

  scrollToTop: (behavior = "smooth") => {
    window.scrollTo({ top: 0, behavior });
  },

  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Copy to clipboard failed:", error);
      return false;
    }
  },

  isMobileScreen: () => {
    return window.innerWidth < 768;
  },

  isTabletScreen: () => {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  },

  isDesktopScreen: () => {
    return window.innerWidth >= 1024;
  },
};

export const statusUtils = {
  getBadgeColor: (status, statusColorMap = {}) => {
    const defaultColors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      paid: "bg-green-100 text-green-800",
      unpaid: "bg-red-100 text-red-800",
    };

    return (
      statusColorMap[status] ||
      defaultColors[status] ||
      "bg-gray-100 text-gray-800"
    );
  },

  getStatusLabel: (status) => {
    return stringUtils.capitalize(status);
  },

  getBreadcrumbPath: (path) => {
    return path.split("/").filter(Boolean);
  },
};
