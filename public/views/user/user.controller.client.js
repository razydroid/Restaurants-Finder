(function() {
    angular
        .module("WebAppMaker")
        .controller("LoginController", LoginController)
        .controller("RegisterController", RegisterController)
        .controller("ProfileController", ProfileController)
        .controller("HomeController", HomeController)
        .controller("AdminController", AdminController);

    function LoginController($timeout, $location, UserService) {
        var vm = this;
        vm.login = login;

        function login(username, password) {
            UserService.findUserByCredentials(username, password)
                .then(function(response){
                    var user = response.data;
                    if (user === null || user === undefined || user === "") {
                        vm.error = "No Such User";
                    }
                    else if (user.admin) {
                        $location.url("/user/" + user._id + "/admin");
                    } else {
                        $location.url("/user/" + user._id + "/home?firstname=" + user.firstName);
                    }
                },function(error){
                    console.log(error);
                    vm.error = "Error Connecting to Server. Please try again later.";
                    $timeout(function () {
                        vm.error = null;
                    }, 5000);
                });
        }
    }

    function RegisterController($location, $timeout, UserService) {
        var vm = this;
        vm.register = register;

        function register(username, password, vpassword) {
            if (username === undefined || username === null || username === "" || password === undefined || password === "") {
                vm.error = "Username and Passwords cannot be empty.";
                return;
            }
            if (password !== vpassword) {
                vm.error = "Password does not match.";
                return;
            }
            UserService.findUserByUsername(username)
                .then(function (response) {
                    var user = response.data;
                    if (user === null || user === "" || user === undefined) {
                        user = {
                            username: username,
                            password: password,
                            firstName: "",
                            lastName: "",
                            email: ""
                        };
                        UserService.createUser(user)
                            .then(function (response) {
                                var user = response.data;
                                $location.url("/user/" + user._id);
                            }, function (error) {
                                console.log(error);
                            });
                    }
                    else {
                        vm.error = "Username already exists.";
                        $timeout(function () {
                            vm.error = null;
                        }, 3000);
                    }
                });
        }
    }

    function ProfileController($routeParams, $timeout, UserService) {
        var vm = this;
        vm.updateUser = updateUser;

        UserService.findUserById($routeParams.uid)
            .then(function (response) {
                vm.user = response.data;
                if(vm.user){
                    vm.username = vm.user.username;
                    vm.firstName = vm.user.firstName;
                    vm.lastName = vm.user.lastName;
                    vm.email = vm.user.email;
                }
            });

        function updateUser() {
            var update_user = {
                _id: $routeParams.uid,
                firstName: vm.firstName,
                lastName: vm.lastName,
                email: vm.email
            };
            UserService.updateUser($routeParams.uid, update_user)
                .then(function (response) {
                    vm.updated = "Profile changes saved!";
                    $timeout(function () {
                        vm.updated = null;
                    }, 3000);
                }, function (error) {
                    console.log(error);
                });
        }
    }

    function HomeController($routeParams, $timeout, $location, UserService) {
        var vm = this;
        vm.textSearch = textSearch;
        vm.uid = $routeParams.uid;
        vm.firstName = $routeParams.firstname;

        function textSearch(text, location, radius) {
            $location.url("/user/" + vm.uid + "/search?text="+text+"&location="+location+"&radius="+radius);
        }
    }

    function AdminController($routeParams, $location, $timeout, UserService) {
        var vm = this;
        vm.deleteUser = deleteUser;
        vm.uid = $routeParams.uid;

        findAllUser();

        function findAllUser() {
            UserService.findAllUser()
                .then(function (response) {
                    vm.users = response.data;
                });
        }

        function deleteUser(uid, username) {
            UserService.deleteUser(uid)
                .then(function (response) {
                    vm.deleted = "user [" + username + "] was deleted";
                    $timeout(function () {
                        vm.deleted = null;
                    }, 3000);
                    findAllUser();
                })
        }
    }
})();