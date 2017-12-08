<template>
    <div class="index bk-img">
        <Row type="flex" justify="center" align="middle">
            <Col span="24">
                <p class="title">登录系统</p>
            </Col>
        </Row>
    </div>
</template>
<script>
    export default {
        methods: {
            handleStart() {
                this.$Modal.info({
                    title: 'Bravo',
                    content: 'Now, enjoy the convenience of iView.'
                });
            }
        }
    };
</script>
<style scoped>
    .bk-img{
        background-position: left;
        background: url(../statics/images/banner.jpg) no-repeat;
        background-size: cover;
    }
    .index {
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        text-align: center;
    }
    .index .ivu-row-flex {
        height: 100%;
    }
    .title {
        font-size: 24px;
        color: #FFFFFF;
    }
</style>