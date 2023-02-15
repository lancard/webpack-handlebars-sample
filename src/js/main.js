// css imports
import "../css/pc/style.scss";

const main = {
    name: 'main',
    init () {
        super.init();
        this.setting();
    },
    setting () {
        super.setting();
        this.html = $("html");
        this.main = $(".wrap.main");
        this.moveTop = $(".move-top");

        this.mainFullPage();

        $("html").addClass('isMain');
    }
};

base.registerEntryModule(main);
