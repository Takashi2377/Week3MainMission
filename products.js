import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

let productModal = null; //先在全域定義空元素，在網頁的初始化階段後才能帶入動元素
let delProductModal = null;

createApp({
  data() {
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/v2",
      apiPath: "yuetin-hexschool",
      products: [],
      isNew: false, //判斷要顯示編輯或新增產品的modal頁面
      tempProduct: {},
    };
  },
  mounted() {
    productModal = new bootstrap.Modal( //利用bootstrap內建的方法將modal實體化
      document.getElementById("productModal"), //初始化階段後帶入動元素
      {
        keyboard: false, //bootstrap內建選項，按esc是否自動關閉modal
        backdrop: "static", //點擊modal外不會自動關閉modal
      }
    );

    delProductModal = new bootstrap.Modal(
      document.getElementById("delProductModal"),
      {
        keyboard: false,
        backdrop: "static",
      }
    );

    // 取出 Token
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common.Authorization = token;

    this.checkAdmin();
  },

  methods: {
    checkAdmin() {
      const url = `${this.apiUrl}/api/user/check`;
      axios
        .post(url)
        .then(() => {
          this.getData();
        })
        .catch((err) => {
          alert(err.response.data.message);
          window.location = "login.html";
        });
    },

    getData() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products/all`;
      axios
        .get(url)
        .then((res) => {
          this.products = res.data.products;
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },

    openModal(status, item) {
      //共有新增、編輯、刪除3種動作需執行，根據點擊的按鈕及帶入的參數，來改變、寫入符合執行動作需求的資料狀態以便渲染相對應的modal畫面
      if (status === "new") {
        this.tempProduct = {
          //將temp帶入空物件以便新增產品
        };
        this.isNew = true; //modal標題顯示新增
        productModal.show();
      } else if (status === "edit") {
        this.tempProduct = { ...item }; //將temp帶入該項item資料以便編輯產品
        this.isNew = false; //modal標題顯示編輯
        productModal.show();
      } else if (status === "delete") {
        this.tempProduct = { ...item };
        delProductModal.show();
      }
    },

    updateProduct() {
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
      let http = "post"; //新增產品的api路徑及方法

      if (!this.isNew) {
        //編輯及新增共用同一個modal，藉由isNew的值來判斷要執行何項功能，並可將兩種功能寫在同一個函式(updateProduct)中
        url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
        http = "put"; //編輯產品的api路徑及方法
      }

      axios[http](url, { data: this.tempProduct })
        .then((res) => {
          alert(res.data.message);
          productModal.hide();
          this.getData(); //更新、新增產品後，重新加載產品列表
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },

    delProduct() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;

      axios
        .delete(url)
        .then((res) => {
          alert(res.data.message);
          delProductModal.hide();
          this.getData();
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    createImages() {
      this.tempProduct.imagesUrl = [];
    },
  },
}).mount("#app");
