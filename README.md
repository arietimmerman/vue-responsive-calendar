# Responsive Calendar for Vue.js

> A responsive calendar with Vue

## Usage

~~~.html
<html>
<head>

<!-- Bootstrap 4 CSS -->
<link rel="stylesheet" href="https://unpkg.com/bootstrap@4.0.0-beta/dist/css/bootstrap.min.css">

<!-- Vue -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.4.2/vue.min.js"></script>

<script src="https://unpkg.com/vue-responsive-calendar@1.0.8/dist/vue-responsive-calendar.browser.js"></script>
<link rel="stylesheet" type="text/css" href="https://unpkg.com/vue-responsive-calendar@1.0.8/dist/vue-responsive-calendar.css">

</head>
<body>

<div id="app">

    <responsive-calendar max-size="l" :events="events"></responsive-calendar>

</div>

<script>
var today = new Date();

const app = new Vue({

  el: '#app',
  data: {
    events: [{
        dateStart: new Date(today.getTime() + (21.5 * 60 * 60 * 1000)),
        dateEnd: new Date(today.getTime() + (22.5 * 60 * 60 * 1000)),
        styleClass: 'optional css class',
        summary: 'Here a summary',
        description: 'The description',
        location: 'Location'
      }
    ]

  }
});
</script>
</body>
</html>
~~~

## Build Setup

``` bash
# install dependencies
npm install

# build for production with minification
npm run build

# develop
npm run dev

```

