
<style lang="scss" scoped>

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  max-width: 800px;
  width: 100%;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}


.date{
  white-space: nowrap;
}

</style>

<template>
  <transition name="modal">
    <div class="modal-mask" @click="$emit('close')">
      <div class="modal-wrapper">
        <div class="modal-container" @click.stop>

          <div class="modal-header d-flex justify-content-between">
            <div>
            <slot name="header">
              Gebeurtenis
            </slot>
            </div>
            <div>
            <strong class="date">
            <slot name="date">
              28 juli 2017, 20:00-22:00
            </slot>
            </strong>
            </div>
          </div>

          <div class="modal-body">
            <slot name="body">
              default body
            </slot>
          </div>

          <div class="modal-footer d-flex justify-content-between">
            <div class="font-italic">
              <slot name="location">
                  Hilversum
              </slot>
            </div>
            <div>
              <slot name="footer">
                <button type="button" class="float-right btn btn-primary" @click="$emit('close')">Close</button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>

//TODO: implement modal like https://vuejs.org/v2/examples/modal.html

export default {
  mounted: function () {
    
    document.addEventListener("keydown", (e) => {
      if (e.keyCode == 27) {
        this.$emit('close');
      }
    });
  }

}

</script>
