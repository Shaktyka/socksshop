let eventBus = new Vue(); // без опций внутри

// Компонент "Продукт"
Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template: `
    <div class="product">

      <div class="product-image">
        <img :src="image" :alt="altText">
      </div>

      <div class="product-info">
        <p>User is premium: {{ shipping }}</p>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
        <a :href="link">Buy</a>
        <p v-if="inStock">In Stock</p>
        <!-- <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p> -->
        <p
          v-else
          :class="{ outOfStock: !inStock }"
        >
          Out Of Stock
        </p>
        <span v-show="onSale">{{ sale }}</span>

        <!= Добавляем компонент product-details =>
        <product-details :details="details"></product-details>

        <div
          class="color-box"
          @mouseover="updateProduct(index)"
          v-for="(variant, index) in variants"
          :key="variant.variantId"
          :style="{ backgroundColor: variant.variantColor}"
        >
        </div>
        <ul>
          <li v-for="size in sizes">{{ size }}</li>
        </ul>
        <button
          v-on:click="addToCart"
          :disabled="!inStock"
          :class="{ disabledButton: !inStock }"
        >
          Add to cart
        </button>
        <button v-on:click="removeFromCart">Remove</button>
      </div>

      <!= Компонент с табами =>
      <product-tabs :reviews="reviews"></product-tabs>

    </div>
  `,
  data() {
    return {
    product: "Socks",
    brand: "Vue Mastery",
    description: "A pair of warm, fuzzy socks",
    selectedVariant: 0,
    altText: "A pair of socks",
    link: "socks.ru",
    inventory: 15,
    onSale: true,
    details: ["80% cotton", "20% polyester", "Gender-newtral"],
    variants: [
      {
        variantId: 2234,
        variantColor: 'green',
        variantImage: "./vmSocks-green.jpg",
        variantQuantity: 10
      },
      {
        variantId: 2235,
        variantColor: 'blue',
        variantImage: "./vmSocks-blue.jpg",
        variantQuantity: 5
      }
    ],
    sizes: ["35-36", "37-38", "39-40", "41-42"],
    reviews: []
    }
  },
  methods: {
    addToCart: function() {
      this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
    },
    removeFromCart: function() {
      this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
    },
    updateProduct: function(index) {
      this.selectedVariant = index;
    }
  },
  computed: {
    title: function() {
      return this.brand + ' ' + this.product;
    },
    image: function() {
      return this.variants[this.selectedVariant].variantImage;
    },
    inStock: function() {
      return this.variants[this.selectedVariant].variantQuantity
    },
    sale: function() {
      if (this.onSale) {
        return this.brand + ' ' + this.product + ' are on sale!';
      } else {
        return this.brand + ' ' + this.product + ' are not on sale';
      }
    },
    shipping: function() {
      if (this.premium) {
        return "Free";
      } else {
        return 2.99;
      }
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview);
    });
  }
});

// Компонент "Детали продукта"
Vue.component('product-details', {
  props: {
    details: {
      type: Array,
      required: true
    }
  },
  template: `
    <ul>
      <li v-for="item in details">{{ item }}</li>
    </ul>
  `
});

// Компонент для получения отзыва
Vue.component('product-review', {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">

      <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">
            {{ error }}
          </li>
        </ul>
      </p>

      <p>
        <label for="name">Name:</label>
        <input type="text" v-model="name" name="name" value="" tabindex="1" />
      </p>

      <p>
        <label for="review">Review:</label>
        <textarea v-model="review" cols="40" rows="8" name="review" id="review"></textarea>
      </p>

      <p>
        <label for="rating">Rating:</label>
        <select v-model="rating" name="rating" id="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p>
        <input type="submit" value="Submit" />
      </p>
    </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      errors: []
    }
  },
  methods: {
    onSubmit: function() {
      if (this.name && this.review && this.rating) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: Number(this.rating)
        }
        eventBus.$emit('review-submitted', productReview);
        name: null;
        review: null;
        rating: null;
      } else {
        if (!this.name) {
          this.errors.push("Name required.");
        }
        if (!this.review) {
          this.errors.push("Review required.");
        }
        if (!this.rating) {
          this.errors.push("Rating required.");
        }
      }
    }
  }
});

// Компонент Табы
Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>
      <div>
        <span
          class="tab"
          :class="{ activeTab: selectedTab === tab }"
          v-for="(tab, index) in tabs"
          :key="index"
          @click="selectedTab = tab"
        >
          {{ tab }}
        </span>
      </div>

      <div v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
          <li v-for="review in reviews">
            <p>{{ review.name }}</p>
            <p>Rating: {{ review.rating }}</p>
            <p>{{ review.review }}</p>
          </li>
        </ul>
      </div>

      <!= Добавляем компонент product-review =>
      <product-review
        v-show="selectedTab === 'Make a Review'"
      ></product-review>
    </div>
  `,
  data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }
});

const app = new Vue({
  el: "#app",
  data: {
    premium: true,
    cart: []
  },
  methods: {
    updateCart(id) {
      this.cart.push(id);
    },
    removeItem(id) {
      for (let i = this.cart.length - 1; i >= 0; i--) {
        if (this.cart[i] === id) {
          this.cart.splice(i, 1);
        }
      }
    }
  }
});
