# 🔧 Frontend Debugging Guide

## ✅ **Issue Fixed: Role Selection Not Working**

### **What was the problem?**
The JavaScript functions were inside a class but the HTML was calling them as global functions.

### **What I fixed:**
1. ✅ Added global wrapper functions for HTML onclick handlers
2. ✅ Added console logging for debugging
3. ✅ Added error handling and safety checks
4. ✅ Restarted the frontend server

---

## 🧪 **How to Test the Fix**

### **Step 1: Open the Frontend**
1. Open your browser
2. Go to: **http://localhost:3000**
3. Open Developer Tools (F12)

### **Step 2: Check Console for Messages**
In the browser console, you should see:
```
DOM loaded, initializing app...
App initialized successfully
```

### **Step 3: Test Role Selection**
1. Click on any role card (Administrator, Collector, Laboratory, Manufacturer)
2. In the console, you should see:
```
Global selectRole called with: admin
selectRole called with: admin
selectRole completed
```

### **Step 4: Verify Login Section Appears**
After clicking a role card, you should see:
- ✅ The card gets highlighted with a green border
- ✅ The login section appears below
- ✅ The selected role name appears in the login header

---

## 🔍 **If It Still Doesn't Work**

### **Check Browser Console**
1. Press F12 to open Developer Tools
2. Click on "Console" tab
3. Look for any error messages in red

### **Common Issues and Solutions**

#### **Issue: "App not initialized"**
**Solution**: Refresh the page and wait for the console message "App initialized successfully"

#### **Issue: "selectRole method not available"**
**Solution**: Check if there are JavaScript errors preventing the app from loading

#### **Issue: No console messages at all**
**Solution**: 
1. Check if JavaScript is enabled in your browser
2. Try a different browser (Chrome, Firefox, Safari)
3. Clear browser cache and refresh

#### **Issue: CORS errors**
**Solution**: Make sure both servers are running:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 🛠️ **Manual Testing Steps**

### **Test 1: Basic Functionality**
1. Open http://localhost:3000
2. Open Developer Tools (F12)
3. Click on "Administrator" card
4. Should see login form appear
5. Check console for success messages

### **Test 2: Role Switching**
1. Click "Administrator" → Should show login form
2. Click "Collector" → Should show login form
3. Click "Laboratory" → Should show login form
4. Click "Manufacturer" → Should show login form

### **Test 3: Consumer QR Scanner**
1. Click "Consumer QR Scanner" button
2. Should navigate to QR scanning interface
3. No login required

---

## 🚨 **Emergency Debugging**

### **If Nothing Works:**
1. **Check Server Status**:
   ```bash
   curl http://localhost:3000
   curl http://localhost:5000/health
   ```

2. **Restart Everything**:
   ```bash
   ./stop-frontend.sh
   ./stop-enhanced-api.sh
   sleep 3
   ./start-enhanced-api.sh
   ./start-frontend.sh
   ```

3. **Check Logs**:
   ```bash
   tail -f frontend/frontend.log
   tail -f server-node-sdk/enhanced-api.log
   ```

4. **Test with Simple HTML**:
   - Go to http://localhost:3000/test.html
   - Click "Test Click" button
   - Should see "JavaScript is working!"

---

## ✅ **Expected Behavior After Fix**

### **When you click a role card:**
1. ✅ Card gets highlighted with green border
2. ✅ Login section appears
3. ✅ Selected role name shows in header
4. ✅ Console shows success messages
5. ✅ No JavaScript errors

### **When you click "Consumer QR Scanner":**
1. ✅ QR scanning interface appears
2. ✅ Input field for QR codes
3. ✅ "Verify" button
4. ✅ No login required

---

## 🎯 **Success Indicators**

### **Frontend Working Correctly:**
- ✅ Role cards are clickable and responsive
- ✅ Login forms appear for each role
- ✅ Consumer QR scanner works without login
- ✅ No JavaScript errors in console
- ✅ Smooth transitions and animations

### **Backend Working Correctly:**
- ✅ http://localhost:5000/health returns {"ok":true}
- ✅ API endpoints respond correctly
- ✅ No server errors in logs

---

## 🎉 **You Should Now Be Able To:**

1. ✅ **Click on any role card** and see the login form
2. ✅ **Register new users** for each role
3. ✅ **Login and access dashboards**
4. ✅ **Test all API endpoints**
5. ✅ **Use the QR scanner** for consumers
6. ✅ **Navigate between different sections**

**The frontend should now be fully functional!** 🌿
