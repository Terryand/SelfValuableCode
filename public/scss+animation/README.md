本目录下的代码，适用于在纯静态页面中使用 Sass( SCSS ) 构建样式文件。

另外，对于动画样式的实现也有一些不错的实践。

具体方式如下：

1、给元素预定义动画的基本属性样式，如 animation-duration

2、通过事件 JS 动态增减 animation-name 属性。

示例代码如下：
```
/* HTML */
<div class="animated"></div>

/* CSS */
.animated {
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
}

.rx {
    animation-name: rX;
}

@keyframes rX {
    0% {
        transform: rolate(0deg);
    }
    100% {
        transform: rolate(180deg);
    }
}

/* JavaScript */
$('div').click(function() {
    $(this).addClass('rx');
})
```

