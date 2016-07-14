<?php

require_once "model.php";
require_once "helper.php";
require_once "repository.php";

session_start();
register_shutdown_function("setFatalErrorResponse");

class ControllerFactory {
    private $controllers = array();
    
    function __construct() {
        $productRepo = new ProductRepository();
        $basketRepo = new BasketRepository();
        $userRepo = new UserRepository();
        $langRepo = new LanguageRepository();
        
        $this->registerController(new ProductController($productRepo));
        $this->registerController(new UserController($userRepo, $langRepo, $basketRepo));
        $this->registerController(new BasketController($basketRepo, $productRepo, $userRepo));
    }
    
    public function resolveController() {
        $normalizedControllerName = strtolower(getStringFromUrl("controller"));
        return $this->controllers[$normalizedControllerName];
    }
    
    private function registerController($controller) {
        $normalizedControllerName = strtolower($controller->name());
        $this->controllers[$normalizedControllerName] = $controller;
    }
}

class ControllerBase {
    private $actions = array();
    private $controllerName;
    
    function __construct($controllerName) {
        $this->controllerName = $controllerName;
    }
    
    public function name() {
        return $this->controllerName;
    }
    
    public function invokeAction() {
        $normalizedActionName = strtolower(getStringFromUrl("action"));
        $this->actions[$normalizedActionName]();
    }
    
    protected function registerAction($actionName, $action) {
        $normalizedActionName = strtolower($actionName);
        $this->actions[$normalizedActionName] = $action;
    }
    
    protected function verifyAuthenticated() {
        if (User::isAuthenticated() === false) {
            setForbiddenResponse();
        }
    }
}

class ProductController extends ControllerBase {
    private $productRepository;
    
    function __construct($productRepository) {
        parent::__construct("product");
        $this->productRepository = $productRepository;
        $this->registerAction("getAll", function() { $this->getAll(); });
        $this->registerAction("get", function() { $this->get(intval(getStringFromUrl("productId"))); });
    }
    
    public function getAll() {
        $products = $this->productRepository->getAll(getLangFromCookie());
        setJsonResponse($products);
    }
    
    public function get($productId) {
        $product = $this->productRepository->getById($productId, getLangFromCookie());
        if ($product === null) {
            setNotFoundResponse();
        }
        else {
            $product->ingredients = $this->productRepository->getIngredients($productId, getLangFromCookie());
            setJsonResponse($product);
        }
    }
}

class BasketController extends ControllerBase {    
    private $basketRepository;
    private $productRepository;
	private $userRepository;
    
    function __construct($basketRepository, $productRepository, $userRepository) {
        parent::__construct("basket");
        $this->basketRepository = $basketRepository;
        $this->productRepository = $productRepository;    
        $this->userRepository = $userRepository;
        $this->registerAction("getBasket", function() { $this->getBasket(getStringFromUrl("id")); });            
        $this->registerAction("getCurrentBasket", function() { $this->getCurrentBasket(); });            
        $this->registerAction("addLineToBasket", function() { $this->addLineToBasket(getJsonInput()); });
        $this->registerAction("removeLinefromBasket", function() { $this->removeLinefromBasket(getJsonInput()); });
        $this->registerAction("completeOrder", function() { $this->completeOrder(); });
    }
    
    public function getBasket($id) {
        $this->verifyAuthenticated();
        
        $basket = $this->basketRepository->getById($id, getLangFromCookie());
        $this->verifyUserPermitted($basket);
        setJsonResponse($basket);
    }
    
    public function getCurrentBasket() {
        $this->verifyAuthenticated();
        
        $basket = User::current()->getBasket();
        setJsonResponse($basket);
    }
    
    public function addLineToBasket($request) {
        $this->verifyAuthenticated();
        
        $basket = User::current()->getBasket();
        $basket->addLine($request["productId"], $request["amount"], getLangFromCookie(), $this->productRepository);
    }
    
    public function removeLinefromBasket($request) {
        $this->verifyAuthenticated();
        
        $basket = User::current()->getBasket();
        $basket->removeLine($request["productId"]);
    }
    
    public function completeOrder() {
        $this->verifyAuthenticated();
        
        $basket = User::current()->getBasket();
        $basket->completeOrder($this->basketRepository, $this->userRepository);
		
        User::current()->basket = null;
        setJsonResponse($basket->id);
    }
    
    private function verifyUserPermitted($basket) {
        if ($basket == null || $basket->userId !== User::current()->id) {
            setErrorResponse("Basket not found or not permitted.");
        }
    }
}

class UserController extends ControllerBase {
    private $userRepository;
    private $languageRepository;
    private $basketRepository;
    
    function __construct($userRepository, $languageRepository, $basketRepository) {
        parent::__construct("user");
        $this->userRepository = $userRepository;
        $this->languageRepository = $languageRepository;
        $this->basketRepository = $basketRepository;
        $this->registerAction("register", function() { $this->register(getJsonInput()); });
        $this->registerAction("existsUser", function() { $this->existsUser(getStringFromUrl("email")); });
        $this->registerAction("login", function() { $this->login(getJsonInput()); });
        $this->registerAction("logout", function() { $this->logout(); });
        $this->registerAction("getCurrent", function() { $this->getCurrent(); });
        $this->registerAction("getBasketSummaryEntries", function() { $this->getBasketSummaryEntries(); });
        $this->registerAction("languages", function() { $this->languages(); });
    }

    public function register($request) {
        $user = new User();
        $user->applyValuesFromArray($request);
        
        if ($user->validate($this->userRepository, $request["passwordConfirm"])) {
            $this->userRepository->insert($user);
        }
        else {
            setErrorResponse("Validation error occured.");
        }
    }
    
    public function existsUser($email) {
        $userExists = $this->userRepository->existsByEmail($email);
        setJsonResponse($userExists);
    }
    
    public function login($request) {
        User::login($this->userRepository, $request["email"], $request["password"]);
        setJsonResponse(User::isAuthenticated());
    }
    
    public function logout() {
        $this->verifyAuthenticated();
        
        User::logout();
    }
    
    public function getCurrent() {
        $this->verifyAuthenticated();
        
        setJsonResponse(User::current());
    }
    
    public function getBasketSummaryEntries() {
        $this->verifyAuthenticated();
        
        $summaryEntries = $this->basketRepository->getSummaryForUser(User::current()->id);
        setJsonResponse($summaryEntries);
    }
        
    public function languages() {
        $languages = $this->languageRepository->getAll();
        setJsonResponse($languages);
    }
}

$controllerFactory = new ControllerFactory();
$controllerFactory->resolveController()->invokeAction();

?>