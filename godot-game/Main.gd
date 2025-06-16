extends Control

@onready var wallet_label = $VBoxContainer/WalletLabel
@onready var status_label = $VBoxContainer/StatusLabel

var wallet_address: String = ""

func _ready():
	print("Godot Web3 Demo started")
	setup_ui()
	get_wallet_address()

func setup_ui():
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	
	status_label.text = "Checking for wallet connection..."
	wallet_label.text = "Wallet: Not connected"

func get_wallet_address():
	# Check if running in web environment
	if OS.has_feature("web"):
		# Use JavaScript bridge to get wallet address from window object
		var js_code = """
		(function() {
			if (window.walletAddress) {
				return window.walletAddress;
			}
			if (window.ethereum && window.ethereum.selectedAddress) {
				return window.ethereum.selectedAddress;
			}
			return null;
		})();
		"""
		
		var result = JavaScriptBridge.eval(js_code)
		if result and result != "null":
			wallet_address = str(result)
			update_wallet_display()
		else:
			# Retry after a short delay
			await get_tree().create_timer(1.0).timeout
			get_wallet_address()
	else:
		# Running in editor or desktop
		wallet_address = "0x1234567890123456789012345678901234567890"
		update_wallet_display()

func update_wallet_display():
	if wallet_address != "":
		wallet_label.text = "Wallet: " + wallet_address
		status_label.text = "✓ Wallet connected successfully!"
		status_label.modulate = Color.GREEN
		
		# Add some interactive elements
		create_interactive_elements()
	else:
		wallet_label.text = "Wallet: Not connected"
		status_label.text = "❌ No wallet found"
		status_label.modulate = Color.RED

func create_interactive_elements():
	# Add a button to refresh wallet info
	var refresh_button = Button.new()
	refresh_button.text = "Refresh Wallet Info"
	refresh_button.pressed.connect(_on_refresh_pressed)
	$VBoxContainer.add_child(refresh_button)
	
	# Add wallet info display
	var info_label = Label.new()
	info_label.text = "Network: " + get_network_info()
	$VBoxContainer.add_child(info_label)

func get_network_info() -> String:
	if OS.has_feature("web"):
		var js_code = """
		(function() {
			if (window.ethereum && window.ethereum.chainId) {
				const chainId = parseInt(window.ethereum.chainId, 16);
				switch(chainId) {
					case 1: return "Ethereum Mainnet";
					case 11155111: return "Sepolia Testnet";
					case 137: return "Polygon Mainnet";
					default: return "Chain ID: " + chainId;
				}
			}
			return "Unknown Network";
		})();
		"""
		var result = JavaScriptBridge.eval(js_code)
		return str(result) if result else "Unknown Network"
	else:
		return "Development Mode"

func _on_refresh_pressed():
	print("Refreshing wallet info...")
	get_wallet_address()