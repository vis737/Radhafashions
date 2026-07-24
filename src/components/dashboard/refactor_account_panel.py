import re

with open('g:/PROJECTS/moris/src/components/AccountPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports for tabs if they are not there
imports = """
import ProfileTab from './dashboard/ProfileTab';
import OrdersTab from './dashboard/OrdersTab';
import TrackingTab from './dashboard/TrackingTab';
import WishlistTab from './dashboard/WishlistTab';
import SupportTab from './dashboard/SupportTab';
import WalletTab from './dashboard/WalletTab';
import SecurityTab from './dashboard/SecurityTab';
"""

if "import ProfileTab" not in content:
    content = content.replace("import DOMPurify", imports + "\nimport DOMPurify")

# Find <AnimatePresence mode="wait"> and </AnimatePresence>
start_str = '<AnimatePresence mode="wait">'
end_str = '</AnimatePresence>'

start_idx = content.find(start_str)
end_idx = content.rfind(end_str)

if start_idx != -1 and end_idx != -1:
    new_tabs = """
            {subTab === 'profile' && (
              <ProfileTab
                currentUser={currentUser!}
                orders={orders}
                setSubTab={setSubTab}
                isEditingAddress={isEditingAddress}
                setIsEditingAddress={setIsEditingAddress}
                shippingName={shippingName}
                setShippingName={setShippingName}
                shippingPhone={shippingPhone}
                setShippingPhone={setShippingPhone}
                shippingAddress={shippingAddress}
                setShippingAddress={setShippingAddress}
                shippingCity={shippingCity}
                setShippingCity={setShippingCity}
                shippingPincode={shippingPincode}
                setShippingPincode={setShippingPincode}
                shippingCarrier={shippingCarrier}
                setShippingCarrier={setShippingCarrier}
              />
            )}

            {subTab === 'orders' && (
              <OrdersTab
                orders={orders}
                setSubTab={setSubTab}
                setTrackingInput={setTrackingInput}
                setSearchedOrder={setSearchedOrder}
                setTrackingError={setTrackingError}
                setSelectedDetailsOrder={setSelectedDetailsOrder}
                onResubmitUpiDetails={onResubmitUpiDetails}
              />
            )}

            {subTab === 'tracking' && (
              <TrackingTab
                orders={orders}
                searchedOrder={searchedOrder}
                trackingInput={trackingInput}
                setTrackingInput={setTrackingInput}
                setSearchedOrder={setSearchedOrder}
                trackingError={trackingError}
                setTrackingError={setTrackingError}
                isLiveConnection={isLiveConnection}
                setIsLiveConnection={setIsLiveConnection}
                isTrackingLoading={isTrackingLoading}
                setIsTrackingLoading={setIsTrackingLoading}
                generateInvoicePDF={generateInvoicePDF}
              />
            )}

            {subTab === 'wishlist' && (
              <WishlistTab
                wishlistProducts={wishlistProducts}
                onSelectProduct={onSelectProduct}
                onRemoveFromWishlist={onRemoveFromWishlist}
                onMoveToCart={onMoveToCart}
                wishlistPrivacy={wishlistPrivacy}
                setWishlistPrivacy={setWishlistPrivacy}
                copiedLink={copiedLink}
                setCopiedLink={setCopiedLink}
              />
            )}

            {subTab === 'returns' && (
              <SupportTab
                orders={orders}
                onRequestRefund={onRequestRefund}
              />
            )}
"""
    content = content[:start_idx + len(start_str)] + new_tabs + "\n" + content[end_idx:]

with open('g:/PROJECTS/moris/src/components/AccountPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("AccountPanel.tsx refactored.")
